
import React from 'react';

interface PageHeaderProps {
    title: string;
    highlight?: string;
    description?: string;
}

export default function PageHeader({ title, highlight, description }: PageHeaderProps) {
    return (
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
            <div className="relative">
                <div className="w-16 h-1.5 bg-blue-600 rounded-full mx-auto mb-6" />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">
                    {title} {highlight && <span className="text-blue-600">{highlight}</span>}
                </h1>
                {description && (
                    <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto font-medium">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
