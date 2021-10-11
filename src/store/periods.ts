import { compareDesc } from "date-fns";
import { selectorFamily } from "recoil";

export const AllPeriodsQuery = selectorFamily({
  key: "AllPeriodsQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      // const response = get(
      //   ApiAuthGetQuery({ endPoint: "/api/admin/users/all" })
      // );
      // return response?.data;

      let data = [
        {
          id: "1",
          name: "Period 1",
          endDate: "2011-10-05T14:48:00.000Z",
          quantifiers: [],
        },
        {
          id: "2",
          name: "Period 2",
          endDate: "2012-10-05T14:48:00.000Z",
          quantifiers: [],
        },
        {
          id: "3",
          name: "Period 3",
          endDate: "2023-10-05T14:48:00.000Z",
          quantifiers: [],
        },
      ];
      data.sort((a, b) => {
        return compareDesc(new Date(a.endDate), new Date(b.endDate));
      });

      return data;
    },
});
