import React, { useState } from 'react';
import { Plus, Save, X, Loader, AlertCircle, HelpCircle } from 'lucide-react';
import { useFeedbackQuestions } from '../../hooks/useReviews';
import { FeedbackQuestion } from '../../types';
import { toast } from 'react-hot-toast';

const CustomerFeedbackManager: React.FC = () => {
  const { questions, isLoading, createQuestion, isCreating } = useFeedbackQuestions();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Omit<FeedbackQuestion, 'id' | 'createdAt' | 'updatedAt'>>({
    questionText: '',
    questionType: 'rating',
    options: [],
    isRequired: true,
    active: true,
    displayOrder: 0
  });
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim()) {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!newQuestion.questionText) {
        toast.error('Question text is required');
        return;
      }
      
      // For multiple choice questions, ensure options exist
      if (newQuestion.questionType === 'multiple_choice' && newQuestion.options.length === 0) {
        toast.error('Please add at least one option for multiple choice questions');
        return;
      }
      
      // Set the display order to be after the last question
      const lastDisplayOrder = questions.length > 0
        ? Math.max(...questions.map(q => q.displayOrder))
        : -1;
      
      await createQuestion({
        ...newQuestion,
        displayOrder: lastDisplayOrder + 1
      });
      
      // Reset form
      setNewQuestion({
        questionText: '',
        questionType: 'rating',
        options: [],
        isRequired: true,
        active: true,
        displayOrder: 0
      });
      
      setIsAddingQuestion(false);
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Feedback Questions</h3>
        {!isAddingQuestion && (
          <button
            type="button"
            onClick={() => setIsAddingQuestion(true)}
            className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-amber-700"
          >
            <Plus size={16} className="mr-2" />
            Add Question
          </button>
        )}
      </div>
      
      {isAddingQuestion && (
        <div className="mb-6 rounded-lg bg-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">New Feedback Question</h4>
            <button
              type="button"
              onClick={() => setIsAddingQuestion(false)}
              className="rounded-full bg-zinc-700 p-1 text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-300">
                Question Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="questionText"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. How satisfied were you with the sound quality?"
              />
            </div>
            
            <div>
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-300">
                Question Type
              </label>
              <select
                id="questionType"
                value={newQuestion.questionType}
                onChange={(e) => setNewQuestion(prev => ({ 
                  ...prev, 
                  questionType: e.target.value as 'rating' | 'text' | 'multiple_choice',
                  // Reset options if changing from multiple_choice
                  options: e.target.value !== 'multiple_choice' ? [] : prev.options
                }))}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="rating">Star Rating</option>
                <option value="text">Text Comment</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>
            
            {newQuestion.questionType === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Options
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="block w-full rounded-l-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="Add an option"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-600 bg-zinc-600 px-3 py-2 font-medium text-white hover:bg-zinc-500"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {newQuestion.options.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between rounded bg-zinc-700 px-3 py-2 text-sm">
                        <span className="text-white">{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-amber-500">Add at least one option</p>
                )}
              </div>
            )}
            
            <div className="flex items-center">
              <input
                id="isRequired"
                type="checkbox"
                checked={newQuestion.isRequired}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-amber-600 focus:ring-amber-600"
              />
              <label htmlFor="isRequired" className="ml-2 text-sm text-gray-300">
                Required question
              </label>
            </div>
            
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || !newQuestion.questionText || (newQuestion.questionType === 'multiple_choice' && newQuestion.options.length === 0)}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Add Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Question List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader size={20} className="animate-spin text-amber-500 mr-2" />
          <span className="text-white">Loading questions...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((question) => (
            <div 
              key={question.id} 
              className={`rounded-lg p-3 ${
                question.active ? 'bg-zinc-800' : 'bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">{question.questionText}</span>
                    {question.isRequired && (
                      <span className="ml-2 rounded-full bg-amber-600/30 px-2 py-0.5 text-xs font-medium text-amber-400">
                        Required
                      </span>
                    )}
                    {!question.active && (
                      <span className="ml-2 rounded-full bg-zinc-600 px-2 py-0.5 text-xs font-medium text-gray-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-400">
                    <span className="rounded bg-zinc-700 px-2 py-0.5">
                      {question.questionType === 'rating' 
                        ? 'Star Rating' 
                        : question.questionType === 'text' 
                          ? 'Text Input'
                          : 'Multiple Choice'}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Order: {question.displayOrder}</span>
                  </div>
                  
                  {question.questionType === 'multiple_choice' && question.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {question.options.map((option, index) => (
                        <span 
                          key={index} 
                          className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-gray-300"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Controls would go here - edit, activate/deactivate, delete */}
                <div className="flex space-x-1">
                  {/* For simplicity, omitting edit & delete functionality */}
                  <button 
                    className={`rounded p-1 text-xs ${
                      question.active ? 'text-green-500' : 'text-gray-500'
                    }`}
                    title={question.active ? 'Active' : 'Inactive'}
                  >
                    <div className={`h-2 w-2 rounded-full ${question.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-zinc-800 p-6 text-center">
          <AlertCircle size={24} className="mx-auto text-gray-500 mb-2" />
          <p className="text-gray-300">No feedback questions configured</p>
          <p className="mt-1 text-xs text-gray-400">
            Add questions to gather structured feedback from customers
          </p>
        </div>
      )}
      
      {/* Info box */}
      <div className="mt-6 rounded-lg bg-zinc-800 p-4">
        <div className="flex items-start">
          <HelpCircle size={16} className="mt-0.5 mr-2 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-white">About Feedback Questions</p>
            <p className="mt-1 text-xs text-gray-400">
              These questions will be presented to customers after they submit their event rating.
              Creating structured questions helps you gather consistent feedback across events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackManager;