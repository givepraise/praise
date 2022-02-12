import { ActiveUserId } from '@/model/auth';
import { Praise, useQuantifyPraise } from '@/model/praise';
import { SingleStringSetting } from '@/model/settings';
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

interface Mark {
  value: number;
  label?: string;
}

const QuantifySlider = ({ praise }: QuantifySliderProps) => {
  const [sliderValue, setSliderValue] = React.useState<number>(0);
  const [marks, setPraiseMarks] = React.useState<Mark[]>([]);
  const activeUserId = useRecoilValue(ActiveUserId);
  const { quantify } = useQuantifyPraise();

  const values = useRecoilValue(
    SingleStringSetting('PRAISE_QUANTIFY_ALLOWED_VALUES')
  );

  const praiseScore = values
    ? values.split(', ').map(Number)
    : '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144'.split(', ').map(Number);

  const getPraiseMarks = () => {
    const marks: Mark[] = [];
    const topScore = praiseScore[praiseScore.length - 1];
    for (let i = 0; i < praiseScore.length; i++) {
      marks.push({
        value: Math.round((i * topScore) / (praiseScore.length - 1)),
      });
    }
    return marks;
  };

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
      // const marks = getPraiseMarks();
      return marks[praiseScore.indexOf(score(praise))]
        ? marks[praiseScore.indexOf(score(praise))].value
        : 0;
    },
    [score]
  );

  const valueToScore = React.useCallback((value: number | number[]) => {
    // const marks = getPraiseMarks();
    return praiseScore[marks.findIndex((mark) => mark.value === value)];
  }, []);

  React.useEffect(() => {
    if (!praise) return;
    setSliderValue(scoreToValue(praise));
    setPraiseMarks(getPraiseMarks());
  }, [praise, setSliderValue, scoreToValue, setPraiseMarks, getPraiseMarks]);

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
    // const marks = getPraiseMarks();
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
        marks={marks}
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
