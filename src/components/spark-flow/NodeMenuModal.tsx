import React from 'react';
import { Sparkles, Dices, Sliders, Layers, Image as ImageIcon, X } from 'lucide-react';
import { NODE_TEMPLATES } from '../../constants/presets';
import type { Point } from '../../types';

interface NodeMenuModalProps {
  isOpen: boolean;
  position: Point | null;
  onClose: () => void;
  onSelectTemplate: (templateType: string) => void;
}

export const NodeMenuModal: React.FC<NodeMenuModalProps> = ({
  isOpen,
  position,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'sparkles':
        return <Sparkles size={16} className="text-amber-400" />;
      case 'dice':
        return <Dices size={16} className="text-pink-400" />;
      case 'sliders':
        return <Sliders size={16} className="text-purple-400" />;
      case 'layers':
        return <Layers size={16} className="text-blue-400" />;
      case 'image':
        return <ImageIcon size={16} className="text-emerald-400" />;
      default:
        return <Sparkles size={16} className="text-neutral-400" />;
    }
  };

  const style: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${Math.min(Math.max(position.x, 20), window.innerWidth - 320)}px`,
        top: `${Math.min(Math.max(position.y, 60), window.innerHeight - 380)}px`,
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <div
      style={style}
      className="z-50 w-[300px] bg-[rgba(20,21,26,0.96)] border border-[rgba(255,255,255,0.12)] rounded-2xl p-3 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-150 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
        <span className="text-xs font-semibold text-neutral-200">添加节点 (Add Node)</span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      <div className="space-y-1">
        {NODE_TEMPLATES.map((item) => (
          <div
            key={item.type}
            onClick={() => onSelectTemplate(item.type)}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all active:scale-98 group"
          >
            <div className="mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/5 group-hover:border-white/20 transition-colors">
              {renderIcon(item.iconType)}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-neutral-200 group-hover:text-white flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {item.inputs.length > 0 ? `in:${item.inputs.length} ` : ''}
                  {item.outputs.length > 0 ? `out:${item.outputs.length}` : ''}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
