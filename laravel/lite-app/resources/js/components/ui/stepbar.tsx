import React from 'react';

interface StepBarProps {
  currentStep: number;
}

const StepBar: React.FC<StepBarProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Genres' },
    { id: 2, label: 'Artistes' },
    { id: 3, label: 'Préférences' },
    { id: 4, label: 'Récap' },
  ];

  return (
    <div className="w-full py-12">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto px-4">
        <div 
          className="absolute left-0 w-full h-[6px] z-0" 
          style={{ 
            backgroundColor: '#D9D9D9', 
            top: '32px'
          }} 
        />

        {steps.map((step) => {
          const isActive = currentStep >= step.id;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
              <div
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-2xl
                  transition-all duration-300
                  ${isActive 
                    ? 'bg-primary ring-6 ring-[#C9B6E9]/30 scale-110'
                    : 'bg-[#757575] scale-100'
                  }
                `}
                style={{ color: 'var(--foreground)' }}
              >
                {step.id}
              </div>
              <span className="mt-5 font-bold transition-all duration-300 opacity-100 var(--foreground)">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepBar;