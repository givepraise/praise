import BreadCrumb from '@/components/BreadCrumb';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import EventLogsTable from './components/EventLogsTable';

const EventLogsPage = (): JSX.Element => {
  return (
    <div className="max-w-4xl mx-auto">
      <BreadCrumb name="Event Log" icon={faBook} />

      <div className="w-full praise-box">
        <h2 className="mb-2">Event Log</h2>
        <Suspense fallback="Loading…">
          <EventLogsTable />
        </Suspense>
      </div>
    </div>
  );
};

export default EventLogsPage;
