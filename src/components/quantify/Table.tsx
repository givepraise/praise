import React from "react";
import RangeSlider from "../RangeSlider";
import { getPraiseMarks } from "@/utils/index";

const praises = [
  {
    id: 1,
    from: 'Blue Apron',
    date: '2021-08-10',
    praise: 'For being a badass person in general',
    quantify_value: 1,
    duplicate_of: '#1002 (x)'
  },
  {
    id: 2,
    from: 'Stingy Stingray',
    date: '2021-08-11',
    praise: 'for doing all that hard work you did with marketing campaign thing',
    quantify_value: 1,
    duplicate_of: null
  }
];

const QuantifyTable = () => {
  let [selectedPraise, setSelectedPraise] = React.useState<any>();

  const handleChange = (value: number) => {
    /** TODO: update praise by Id (saved in selectedPraise) */
  }

  return (
    <table className="w-full table-auto">
      <thead>        
          <tr>            
            <th className="text-left">Id</th>
            <th className="text-left">From</th>
            <th className="text-left">Date</th>
            <th className="text-left">Praise</th>
            <th>Quantify</th>
            <th>Duplicate of</th>   
          </tr>        
      </thead>
      <tbody>                  
         {praises.map(( praise, index ) => {
          return (
            <tr key={index} onMouseDown={() => setSelectedPraise(praise)}>
              <td>{praise.id}</td>
              <td>{praise.from}</td>
              <td>{praise.date}</td>
              <td>{praise.praise}</td>
              <td>
                <RangeSlider marks={getPraiseMarks()} defaultValue={praise.quantify_value} onValueChanged={(value: number) => handleChange(value)}></RangeSlider>
              </td>
              <td>{praise.duplicate_of}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default QuantifyTable;
