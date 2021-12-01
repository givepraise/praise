import Slider, { SliderTooltip } from "rc-slider";
import "../styles/slider.css";

interface RangeSliderProps {
  marks: any;
  defaultValue: number;
  onValueChanged(value: number): void;
  disabled?: boolean;
}

const RangeSlider = ({
  marks,
  defaultValue,
  onValueChanged,
  disabled
}: RangeSliderProps) => {
  const { Handle } = Slider;

  const handle = (props: any) => {
    const { value: key, dragging, index, ...restProps } = props;
    const value = marks[key];

    if (!disabled) {
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
    } else {
      return (<div></div>);
    }
  };

  const wrapperStyle = { width: 200, margin: 10 };

  return (
    <div>
      <div style={wrapperStyle}>
        <Slider
          disabled={disabled}
          min={0}
          max={144}
          defaultValue={defaultValue}
          marks={marks}
          step={null}
          onAfterChange={(value) => onValueChanged(value)}
          handle={handle}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
