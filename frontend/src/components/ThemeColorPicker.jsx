import React from 'react';

const PRESETS = [
  { color: '#1E40AF', name: 'Blue'   },
  { color: '#059669', name: 'Green'  },
  { color: '#DC2626', name: 'Red'    },
  { color: '#7C3AED', name: 'Purple' },
  { color: '#D97706', name: 'Amber'  },
  { color: '#0891B2', name: 'Cyan'   },
  { color: '#BE185D', name: 'Pink'   },
  { color: '#374151', name: 'Dark'   },
];

const ThemeColorPicker = ({ value = '#1E40AF', onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        🎨 Theme Color
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map(({ color, name }) => (
          <button
            key={color}
            title={name}
            onClick={() => onChange(color)}
            className="w-8 h-8 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              border: value === color ? '3px solid #000' : '2px solid transparent',
              outline: value === color ? '2px solid white' : 'none',
              outlineOffset: '-4px'
            }}
          />
        ))}

        {/* Custom color */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
            title="Custom color"
          />
        </div>

        {/* Preview */}
        <div
          className="ml-2 px-3 py-1 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: value }}
        >
          Preview
        </div>
      </div>
    </div>
  );
};

export default ThemeColorPicker;