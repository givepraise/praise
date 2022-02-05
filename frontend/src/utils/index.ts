import { Mark } from "@mui/material";
import React from "react";

export const useOutsideAlerter = (ref: any) => {
  const [timestamp, setTimestamp] = React.useState<number>(0);

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        setTimestamp(event.timeStamp);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const reset = () => {
    setTimestamp(0);
  };
  return { timestamp, reset };
};

export const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

export const shortenEthAddress = (address: string) => {
  if (!address || !address.length) return null;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export const praiseScore = [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144];

export const getPraiseMarks = () => {
  let marks: Mark[] = [];
  let topScore = praiseScore[praiseScore.length - 1];
  for (let i = 0; i < praiseScore.length; i++) {
    marks.push({
      value: Math.round((i * topScore) / (praiseScore.length - 1)),
    });
  }
  return marks;
};

export const getPraiseMark = (score: number) => {
  let topScore = praiseScore[praiseScore.length - 1];
  const markStep = Math.round(topScore / (praiseScore.length - 1));
  const i = praiseScore.findIndex((s) => s === score);
  return markStep * i;
};
