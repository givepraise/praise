import React from 'react';
import Slider, { SliderTooltip } from 'rc-slider';
import "../styles/slider.css";

interface RangeSliderProps {  
  marks: any;
  defaultValue: number;
  onValueChanged(value: number): void;
}

const RangeSlider = ({ marks, defaultValue, onValueChanged }: RangeSliderProps ) => {
  const { Handle } = Slider;  

  const handle = (props: any) => {
    const { value, dragging, index, ...restProps } = props;    
    
    return (
      <SliderTooltip
        prefixCls="rc-slider-tooltip"
        overlay={`${value}`}        
        visible={true}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </SliderTooltip>
    );
  };

  const wrapperStyle = { width: 100, margin: 10 };  

  return (
    <div>
      <div style={wrapperStyle}>
        <Slider min={1} max={144} defaultValue={defaultValue} marks={marks} step={null} onAfterChange={(value) => onValueChanged(value)} handle={handle} />
      </div>
    </div>
  );
}

export default RangeSlider;