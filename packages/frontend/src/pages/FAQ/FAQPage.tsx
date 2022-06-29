import { FAQItem } from 'api/dist/settings/types';
import { faCaretUp, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Disclosure } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SingleSetting } from '@/model/settings';
import BreadCrumb from '@/components/BreadCrumb';

const FAQPage = (): JSX.Element | null => {
  const siteFAQSetting = useRecoilValue(SingleSetting('PRAISE_FAQ'));
  const faq = siteFAQSetting?.valueRealized as FAQItem[];

  if (!faq || !faq.length) return null;

  return (
    <div className="praise-page">
      <BreadCrumb name="FAQ" icon={faQuestionCircle} />

      <div className="w-full praise-box">
        <h2 className="mb-4">FAQ</h2>
        <React.Suspense fallback={null}>
          {faq.map((data, index) => {
            return (
              <div key={index}>
                <h3 className="block mt-8 mb-4 font-bold">{data.section}</h3>

                {data.questions.map((item, i) => {
                  return (
                    <Disclosure defaultOpen={false} as="div" key={i}>
                      {({ open }): JSX.Element => (
                        <>
                          <Disclosure.Button className="flex justify-between w-full px-4 py-2 mb-2 font-medium text-left rounded-lg bg-warm-gray-100 hover:bg-warm-gray-200 focus:outline-none dark:bg-slate-700">
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
              </div>
            );
          })}
        </React.Suspense>
      </div>
    </div>
  );
};

export default FAQPage;
