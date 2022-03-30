import { ActiveUserId } from '@/model/auth';
import { useQuantifyPraise } from '@/model/praise';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { Slider, Tooltip } from '@mui/material';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { useRecoilValue } from 'recoil';

interface ValueLabelComponentProps {
  children: JSX.Element;
  value: string;
}
const ValueLabelComponent = ({
  children,
  value,
}: ValueLabelComponentProps): JSX.Element => {
  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

interface Mark {
  value: number;
  label?: string;
}

interface QuantifySliderProps {
  praise: PraiseDto;
  periodId: string;
}

const QuantifySlider = ({
  praise,
  periodId,
}: QuantifySliderProps): JSX.Element => {
  const [selectedSliderMark, setSelectedSliderMark] = React.useState<number>(0);
  const [sliderMarks, setSliderMarks] = React.useState<Mark[]>([]);
  const [scores, setScores] = React.useState<number[]>([]);
  const activeUserId = useRecoilValue(ActiveUserId);
  const { quantify } = useQuantifyPraise();
  const allowedValues = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_ALLOWED_VALUES'
  ) as number[];

  React.useEffect(() => {
    if (!allowedValues) return;
    setScores(allowedValues);
  }, [allowedValues]);

  const allowedSliderValuesToMarks = React.useCallback((): Mark[] => {
    const marks: Mark[] = [];
    const topScore = scores[scores.length - 1];
    for (let i = 0; i < scores.length; i++) {
      marks.push({
        value: Math.floor((i * topScore) / (scores.length - 1)),
      });
    }
    return marks;
  }, [scores]);

  const quantification = React.useCallback(
    (praise: PraiseDto) => {
      return praise.quantifications.find((q) => q.quantifier === activeUserId);
    },
    [activeUserId]
  );

  const dismissed = React.useCallback(
    (praise: PraiseDto) => {
      const q = quantification(praise);
      return q ? !!q.dismissed : false;
    },
    [quantification]
  );

  const duplicate = React.useCallback(
    (praise: PraiseDto) => {
      const q = quantification(praise);
      return q ? (q.duplicatePraise ? true : false) : false;
    },
    [quantification]
  );

  const score = React.useCallback(
    (praise: PraiseDto) => {
      const q = quantification(praise);
      return q && q.score ? q.score : 0;
    },
    [quantification]
  );

  const scoreToMark = React.useCallback(
    (praise: PraiseDto) => {
      return sliderMarks[scores.indexOf(score(praise))]
        ? sliderMarks[scores.indexOf(score(praise))].value
        : 0;
    },
    [sliderMarks, scores, score]
  );

  React.useEffect(() => {
    if (scores.length === 0 || sliderMarks.length > 0) return;
    setSliderMarks(allowedSliderValuesToMarks());
  }, [scores, sliderMarks, setSliderMarks, allowedSliderValuesToMarks]);

  React.useEffect(() => {
    if (!praise) return;
    setSelectedSliderMark(scoreToMark(praise));
  }, [praise, setSelectedSliderMark, scoreToMark]);

  const handleOnChange = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ): void => {
    if (!Array.isArray(value)) {
      setSelectedSliderMark(value);
    }
  };

  const handleOnChangeCommitted = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ): void => {
    const q = quantification(praise);
    const score = scores[sliderMarks.findIndex((mark) => mark.value === value)];
    if (!q) return;
    void quantify(
      praise._id,
      score,
      q.dismissed ? q.dismissed : false,
      q.duplicatePraise ? q.duplicatePraise : null
    );
  };

  function valueLabelFormat(value: number): number {
    return scores[sliderMarks.findIndex((mark) => mark.value === value)];
  }

  const sliderMax = (): number => {
    return sliderMarks.length > 0
      ? sliderMarks[sliderMarks.length - 1].value
      : 0;
  };

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
        marks={sliderMarks}
        valueLabelFormat={valueLabelFormat}
        value={selectedSliderMark}
        disabled={dismissed(praise) || duplicate(praise)}
        onChange={handleOnChange}
        onChangeCommitted={handleOnChangeCommitted}
        min={0}
        max={sliderMax()}
      />
    </div>
  );
};

export default QuantifySlider;
