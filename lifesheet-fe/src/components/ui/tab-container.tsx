import type { ReactNode } from "react";
import React from "react";

interface TabContainerProps {
    tabs: { label: string, content: ReactNode }[];
}
export function TabContainer({ tabs }: TabContainerProps) {
    const [activeTab, setActiveTab] = React.useState(tabs[0].label);
    const content = tabs.find(tab => tab.label === activeTab)?.content;
    return (
        <div className="w-full">
            <TabToolbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            {content}
        </div>
    );
}
export function TabToolbar({ tabs, activeTab, setActiveTab }: TabContainerProps & { activeTab: string, setActiveTab: (tab: string) => void }) {
    return (
        <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.label}
                    className={`px-4 py-2 -mb-px font-medium text-sm ${tab.label === activeTab
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                    onClick={() => setActiveTab(tab.label)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}