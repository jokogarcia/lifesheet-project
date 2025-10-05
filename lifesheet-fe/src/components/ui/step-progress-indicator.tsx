import moduleStyles from './step-progress-indicator.module.css';
export interface StepProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}
export const StepProgressIndicator = (props: StepProgressIndicatorProps) => {
  const { steps, currentStep, onStepClick } = props;
  const width = Math.floor(100/steps.length);
  console.log("width", width);
  return (
    <div className={moduleStyles['progressbar-wrapper'] }>
      <ul className={moduleStyles.progressbar} >
        {steps.map((step, index) => {
          let className = '';
          if (onStepClick) className = moduleStyles.interactive;
          if (index < currentStep) className = moduleStyles.previous;
          if (index === currentStep) className = moduleStyles.active;
          return (
            <li
              key={index}
              className={className}
              style={{width: `${width}%`}}
              onClick={() => !!onStepClick && onStepClick(index)}
            >
              {step}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
