import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import PeriodDetails from "@/components/periods/detail/Details";
import PeriodNameForm from "@/components/periods/detail/PeriodNameForm";
import Quantifiers from "@/components/periods/detail/Quantifiers";
import PeriodSummary from "@/components/periods/detail/PeriodSummary";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { default as React } from "react";
import "react-day-picker/lib/style.css";

const PeriodDetailPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback="Loading…">
        <div className="praise-box w-2/3 ">
          <PeriodNameForm />
          <PeriodDetails />
        </div>
        <Quantifiers />
        <PeriodSummary />
      </React.Suspense>
    </>
  );
};

export default PeriodDetailPage;
