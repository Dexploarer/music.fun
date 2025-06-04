import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  categorized?: boolean;
  categories?: Record<string, string[]>;
}

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Add a tag...',
  suggestions = [],
  categorized = false,
  categories = {}
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      const updatedTags = [...value, inputValue.trim()];
      onChange(updatedTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = value.filter(t => t !== tag);
    onChange(updatedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!value.includes(suggestion)) {
      const updatedTags = [...value, suggestion];
      onChange(updatedTags);
    }
  };

  return (
    <div className="space-y-2">
      <div className="mt-1 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 font-medium text-white hover:bg-zinc-600"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-300"
            >
              <Tag size={10} className="mr-1 text-amber-500" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-zinc-700 hover:text-white"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {suggestions.length > 0 && !categorized && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={value.includes(suggestion)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium 
                  ${value.includes(suggestion) 
                    ? 'bg-amber-600 text-white cursor-default' 
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {categorized && Object.keys(categories).length > 0 && (
        <div className="mt-4 space-y-3">
          {Object.entries(categories).map(([category, categoryTags]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{category}</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {categoryTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(tag)}
                    disabled={value.includes(tag)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium 
                      ${value.includes(tag) 
                        ? 'bg-amber-600 text-white cursor-default' 
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;