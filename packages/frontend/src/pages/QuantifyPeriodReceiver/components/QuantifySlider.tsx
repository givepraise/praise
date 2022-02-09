import { ActiveUserId } from '@/model/auth';
import { Praise, useQuantifyPraise } from '@/model/praise';
import { getPraiseMarks, praiseScore } from '@/utils/index';
import { Slider, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import { useRecoilValue } from 'recoil';

const ValueLabelComponent: FC<any> = (props) => {
  const { children, value } = props;
  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

interface QuantifySliderProps {
  praise: Praise;
}

const QuantifySlider = ({ praise }: QuantifySliderProps) => {
  const [sliderValue, setSliderValue] = React.useState<number>(0);
  const activeUserId = useRecoilValue(ActiveUserId);
  const { quantify } = useQuantifyPraise();

  const quantification = React.useCallback(
    (praise: Praise) => {
      return praise.quantifications!.find((q) => q.quantifier === activeUserId);
    },
    [activeUserId]
  );

  const dismissed = React.useCallback(
    (praise: Praise) => {
      const q = quantification(praise);
      return q ? !!q.dismissed : false;
    },
    [quantification]
  );

  const duplicate = React.useCallback(
    (praise: Praise) => {
      const q = quantification(praise);
      return q ? (q.duplicatePraise ? true : false) : false;
    },
    [quantification]
  );

  const score = React.useCallback(
    (praise: Praise) => {
      const q = quantification(praise);
      return q && q.score ? q.score : 0;
    },
    [quantification]
  );

  const scoreToValue = React.useCallback(
    (praise: Praise) => {
      const marks = getPraiseMarks();
      return marks[praiseScore.indexOf(score(praise))].value;
    },
    [score]
  );

  const valueToScore = React.useCallback((value: number | number[]) => {
    const marks = getPraiseMarks();
    return praiseScore[marks.findIndex((mark) => mark.value === value)];
  }, []);

  React.useEffect(() => {
    if (!praise) return;
    setSliderValue(scoreToValue(praise));
  }, [praise, setSliderValue, scoreToValue]);

  const handleOnChange = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ) => {
    if (!Array.isArray(value)) {
      setSliderValue(value);
    }
  };

  const handleOnChangeCommitted = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ) => {
    const q = quantification(praise);
    const score = valueToScore(value);

    void quantify(
      praise._id,
      score,
      q!.dismissed ? q!.dismissed : false,
      q!.duplicatePraise ? q!.duplicatePraise : null
    );
  };

  function valueLabelFormat(value: any) {
    const marks = getPraiseMarks();
    return praiseScore[marks.findIndex((mark) => mark.value === value)];
  }

  return (
    <div className="inline-block w-40">
      <Slider
        classes={{
          colorPrimary: 'local-MuiSlider-colorPrimary',
          disabled: 'local-MuiSlider-disabled',
        }}
        key={praise._id}
        valueLabelDisplay="on"
        step={null}
        components={{ ValueLabel: ValueLabelComponent }}
        marks={getPraiseMarks()}
        valueLabelFormat={valueLabelFormat}
        value={sliderValue}
        disabled={dismissed(praise) || duplicate(praise)}
        onChange={handleOnChange}
        onChangeCommitted={handleOnChangeCommitted}
        min={0}
        max={144}
      />
    </div>
  );
};

export default QuantifySlider;
