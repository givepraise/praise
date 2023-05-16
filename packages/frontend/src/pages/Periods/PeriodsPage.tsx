import { faCalendarAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { AdminOnly } from '@/components/auth/AdminOnly';
import { Page } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { Box } from '@/components/ui/Box';
import { PeriodsTable } from './components/Table';

const PeriodsPage = (): JSX.Element | null => {
  return (
    <Page>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />

      <ActiveNoticesBoard />

      <Box className="px-0">
        <AdminOnly>
          <div className="px-5 mb-5 text-right">
            <Link to="/periods/createupdate">
              <Button id="create-period-button">
                <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
                Create period
              </Button>
            </Link>
          </div>
        </AdminOnly>
        <React.Suspense fallback={null}>
          <PeriodsTable />
        </React.Suspense>
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodsPage;
