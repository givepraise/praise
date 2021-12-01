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

export const getPraiseMarks = () => {
  return {
    0: 0,
    14: 1,
    29: 3,
    43: 5,
    58: 8,
    72: 13,
    86: 21,
    101: 34,
    115: 55,
    130: 89,
    144: 144,
  };
};
