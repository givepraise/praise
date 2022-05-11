import BreadCrumb from '@/components/BreadCrumb';
import { faCogs, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { SingleSetting } from '@/model/settings';
import { useRecoilValue } from 'recoil';
import { Disclosure } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQPage = (): JSX.Element | null => {
  const siteFAQSetting = useRecoilValue(SingleSetting('PRAISE_FAQ'));
  const data = siteFAQSetting?.value ? JSON.parse(siteFAQSetting?.value) : [];
  const faq: FAQItem[] = data.faq;

  if (!data.faq) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="w-full praise-box">
        <h2 className="mb-4">FAQ</h2>
        <React.Suspense fallback="Loading…">
          {faq.map((item, index) => {
            return (
              <Disclosure
                defaultOpen={index === 0 ? true : false}
                as="div"
                key={index}
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 mb-2 font-medium text-left bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none">
                      <span>{item.question}</span>
                      <FontAwesomeIcon
                        icon={faCaretUp}
                        size="1x"
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-1 pb-3">
                      {item.answer}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            );
          })}
        </React.Suspense>
      </div>
    </div>
  );
};

export default FAQPage;
