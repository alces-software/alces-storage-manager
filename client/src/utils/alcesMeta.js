
export default {
  alcesMeta: {},

  getAlcesMeta(name) {
    const json = document.body.getAttribute("data-alces-metadata")
    const md = JSON.parse(json);
    if (md) {
      this.alcesMeta = md;
    }
    return this.alcesMeta[name];
  }
}
