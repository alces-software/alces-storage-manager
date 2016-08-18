
import debug from 'debug';
import _ from 'lodash';
import React, {PropTypes} from 'react';
import noVNC from 'novnc-node';

const aamDebug = debug('AAM')

const bellFiles = _.map(_.range(1, 6), number => require(`sounds/bell${number}.ogg`));

class NoVnc extends React.Component {
  render() {
    const {novnc} = this.props;

    // Ensure the VNC session is displayed at its full height.
    const novncWrapperStyles = {height: novnc.height};

    return (
      <div id="novnc-wrapper" className="novnc" styles={novncWrapperStyles}>
        <canvas
          id='novnc-canvas'
          className={novnc.viewportDrag ? "novnc-canvas--dragEnabled" : ""}
          onMouseOver={this.handleMouseOver.bind(this)}
          onMouseOut={this.handleMouseOut.bind(this)}
          >
        </canvas>
      </div>
    );
  }

  componentWillMount() {
    this.resizeViewport.bind(this);
  }

  componentDidMount() {
    this.canvas = document.getElementById('novnc-canvas');

    this.rfb = new noVNC.RFB({
      local_cursor: true, // eslint-disable-line camelcase
      target: this.canvas,
      onUpdateState: this.stateHandler.bind(this),
      onBell: this.bellHandler.bind(this),
      onClipboard: this.clipboardHandler.bind(this),
    });

    window.addEventListener("resize", this.resizeViewport.bind(this));

    this.connect();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeViewport.bind(this));

    this.rfb.disconnect();

    // Reset noVNC state; we want everything to start fresh for each session
    // connected to.
    this.props.novncActions.reset();

    // Shouldn't be needed but make sure no longer attempting resize at regular
    // intervals.
    window.clearInterval(this.intervalResizeId);
  }

  // Resize noVNC viewport to dimensions of wrapper div.
  // Note: In Portal this is debounced, do we need to do this here?
  resizeViewport() {
    const novncWrapper = document.getElementById("novnc-wrapper");
    const width = novncWrapper.clientWidth;
    const height = novncWrapper.clientHeight;
    if (width && height) {
      aamDebug(`Resizing viewport to: width ${width}, height ${height}`);
      const display = this.rfb.get_display();
      display.viewportChangeSize(width, height);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handlePasting(nextProps);
    this.handleDragViewportModeTransition(nextProps);
    this.handleNoVncStateTransitions(nextProps);
  }

  handlePasting(nextProps) {
    const {
      formActions,
      novnc,
      novncActions,
    } = nextProps;

    const currentlyPasting = this.state && this.state.pastingText;
    const startingPaste = novnc.pastedText && !currentlyPasting;
    const finishedPaste = !novnc.pastedText && currentlyPasting

    // We monitor when we receive new text to paste and set a flag in the
    // component's state until the paste has completed; this ensures that the
    // paste doesn't occur multiple times if the component receives props again
    // while the initial paste has yet to complete.
    if (startingPaste) {
      this.setPastingText(true);

      // Send text to session clipboard.
      this.rfb.clipboardPasteFrom(novnc.pastedText)

      // Send all keys of pasted text to session directly.
      for (let i=0; i<novnc.pastedText.length; i++) {
        this.rfb.sendKey(novnc.pastedText.charCodeAt(i));
      }

      // Dispatch that paste is complete; will set pastedText to undefined so
      // we don't receive the same pastedText in future prop updates.
      novncActions.pasteComplete();

      // Clear the form.
      formActions.reset('vnc-paste-modal');
    }
    else if (finishedPaste) {
      this.setPastingText(false);
    }
  }

  setPastingText(pastingText) {
    this.setState({
      pastingText,
    })
  }

  handleDragViewportModeTransition(nextProps) {
    const {novnc} = nextProps;
    if (novnc.viewportDrag !== this.props.novnc.viewportDrag) {
      this.rfb.set_viewportDrag(novnc.viewportDrag);
    }
  }

  handleNoVncStateTransitions(nextProps) {
    const {novnc, novncActions} = nextProps;

    const transitioningToState = (state) =>
      novnc.state === state && this.props.novnc.state !== state;

    if (transitioningToState('failed')) {
      const sessionFailedOnInitialConnect =
        this.props.novnc.state === 'connect';
      novncActions.showSessionFailedModal(sessionFailedOnInitialConnect);
    }
    else if (transitioningToState('normal')) {
      const display = this.rfb.get_display();
      novncActions.setDimensions(display.get_width(), display.get_height());
      display.set_viewport(true);
      this.resizeViewport();
    }
  }

  stateHandler(rfb, state, oldstate, msg) {
    // The stateChange action just takes these two of the onUpdateState
    // parameters since we don't want to store the rfb object and oldstate is
    // just the previous state, which is easily obtainable if needed.
    this.props.novncActions.stateChange(state, msg);
  }

  bellHandler() {
    // Don't sound a bell more often than every 250ms - would be annoying and
    // noVNC also calls the onBell function 3 times for every 1 bell event.
    if (this.bellTimer) return;
    this.bellTimer = setTimeout(() => this.bellTimer = undefined, 250);

    if (this.props.novnc.soundEnabled) {
      this.currentBell = this.currentBell === undefined ? 0 : ++this.currentBell % 5;
      new Audio(bellFiles[this.currentBell]).play();
    }
  }

  clipboardHandler(rfb, text) {
    this.props.novncActions.setCopyText(text);
  }

  connect() {
    const {url, password} = this.props;
    this.rfb.connect(url, password);
  }

  handleMouseOver() {
    // When component moused over make keyboard send keys to canvas and focus
    // the canvas, so keys sent to the VNC session; this does not seem to
    // consistently happen otherwise.
    this.rfb.get_keyboard().set_focused(true);
    this.canvas.focus();

    // Not sure if this is needed (done in Portal but can't tell any difference
    // with or without), but no harm in case this is necessary sometimes.
    this.rfb.get_mouse().set_focused(true);

    // Slight hack to make sure resizing is always occurring appropriately.
    // When dragging the viewport it was being expanded to include the dragged
    // area rather than just repositioning; for some reason it also doesn't
    // start with the correct dimensions if the initial window size is too
    // small. This attempts to fix these issues by frequently resizing the
    // viewport to the correct dimensions.
    this.intervalResizeId = window.setInterval(this.resizeViewport.bind(this), 500);
  }

  handleMouseOut() {
    // Don't send keys to canvas any more when mouse leaves.
    this.rfb.get_keyboard().set_focused(false);
    this.rfb.get_mouse().set_focused(false);

    // Stop resizing when mouse has left as no possibility viewport could be
    // incorrect size.
    window.clearInterval(this.intervalResizeId);
  }
}

NoVnc.propTypes = {
  url: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  novnc: PropTypes.object.isRequired, // noVNC Redux store state.
  novncActions: PropTypes.object.isRequired,
  formActions: PropTypes.object.isRequired,
};

export default NoVnc;
