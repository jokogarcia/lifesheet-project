import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface FAQItemProps {
  questionKey: string;
  answerKey: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ questionKey, answerKey }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 pr-4">
          <FormattedMessage id={questionKey} />
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="text-gray-700 leading-relaxed">
            <FormattedMessage id={answerKey} />
          </div>
        </div>
      )}
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqItems = [
    { questionKey: 'faq.whatIsLifesheet', answerKey: 'faq.whatIsLifesheet.answer' },
    { questionKey: 'faq.howDoesItWork', answerKey: 'faq.howDoesItWork.answer' },
    { questionKey: 'faq.freeVsPremium', answerKey: 'faq.freeVsPremium.answer' },
    { questionKey: 'faq.freeTrial', answerKey: 'faq.freeTrial.answer' },
    { questionKey: 'faq.cancelSubscription', answerKey: 'faq.cancelSubscription.answer' },
    { questionKey: 'faq.getSupport', answerKey: 'faq.getSupport.answer' },
    { questionKey: 'faq.contactUs', answerKey: 'faq.contactUs.answer' },
    { questionKey: 'faq.dataSafety', answerKey: 'faq.dataSafety.answer' },
    { questionKey: 'faq.deleteData', answerKey: 'faq.deleteData.answer' },
    { questionKey: 'faq.exportData', answerKey: 'faq.exportData.answer' },
    { questionKey: 'faq.recoverDeletedAccount', answerKey: 'faq.recoverDeletedAccount.answer' },
    { questionKey: 'faq.recoverResetAccount', answerKey: 'faq.recoverResetAccount.answer' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              <FormattedMessage id="faq.title" />
            </h1>
          </div>
          <div className="divide-y divide-gray-200">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                questionKey={item.questionKey}
                answerKey={item.answerKey}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
