import React from 'react';
import { Step } from '../types';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Waiting for AI to generate steps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = step.status === 'completed';
        const isInProgress = step.status === 'in-progress';

        return (
          <div
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              isActive
                ? 'bg-purple-600/20 border-purple-500/50 shadow-lg scale-105'
                : isCompleted
                ? 'bg-green-600/10 border-green-500/30 hover:border-green-500/50'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/30'
            }`}
          >
            {/* Status Indicator */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {isCompleted ? (
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                ) : isInProgress ? (
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-600/20 rounded-full flex items-center justify-center">
                    <Circle className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500">
                    Step {index + 1}
                  </span>
                  {step.status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isCompleted
                          ? 'bg-green-500/20 text-green-400'
                          : isInProgress
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-600/20 text-gray-500'
                      }`}
                    >
                      {step.status}
                    </span>
                  )}
                </div>
                <h3
                  className={`text-sm font-semibold mb-1 line-clamp-2 ${
                    isActive || isCompleted ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-xl"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}