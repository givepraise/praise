import { faCalendarAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { AdminOnly } from '@/components/auth/AdminOnly';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraiseButton } from '@/components/ui/PraiseButton';
import { PraisePage } from '@/components/ui/PraisePage';
import { AllPeriods } from '@/model/periods';

import { PeriodsTable } from './components/Table';

const PeriodsPage = (): JSX.Element | null => {
  const allPeriods = useRecoilValue(AllPeriods);

  if (!allPeriods) return null;

  return (
    <PraisePage>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />

      <ActiveNoticesBoard />

      <div className="px-0 praise-box">
        <AdminOnly>
          <div className="px-5 mb-2 text-right">
            <Link to="/periods/createupdate">
              <PraiseButton id="create-period-button">
                <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
                Create period
              </PraiseButton>
            </Link>
          </div>
        </AdminOnly>
        <React.Suspense fallback={null}>
          <PeriodsTable />
        </React.Suspense>
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodsPage;
