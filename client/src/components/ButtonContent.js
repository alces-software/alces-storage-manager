
import React from 'react';

import Icon from 'components/Icon';

const ButtonContent = ({text, iconName}) => (
  <span>
    {text}&nbsp;&nbsp;<Icon name={iconName}/>
  </span>
);

export default ButtonContent;
