import React from 'react';

interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  icon: string;
  trigger: {
    type: string;
    conditions?: any;
  };
  effect: {
    type: string;
    value?: number;
    chance?: number;
  };
}

interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'neutral';
  icon: string;
  duration: number;
  value?: number;
  notes?: string;
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'status' | 'passive';
  data: StatusEffect | PassiveAbility | null;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, type, data }) => {
  if (!isOpen || !data) return null;

  const renderStatusInfo = (status: StatusEffect) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{status.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-purple-100">{status.name}</h3>
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              status.type === 'debuff' 
                ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                : status.type === 'buff'
                ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                : 'bg-slate-500/30 text-slate-200 border border-slate-400/50'
            }`}>
              {status.type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Description</h4>
          <p className="text-purple-100">{status.notes || 'No description available.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
            <div className="text-xs text-purple-300 mb-1">Duration</div>
            <div className="text-lg font-bold text-purple-100">{status.duration} turns</div>
          </div>
          {status.value !== undefined && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Damage/Heal</div>
              <div className="text-lg font-bold text-purple-100">{status.value} HP</div>
            </div>
          )}
        </div>

        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
          <h4 className="text-xs font-semibold text-blue-300 mb-2">💡 Tips</h4>
          <ul className="text-xs text-blue-100 space-y-1">
            {status.type === 'debuff' && (
              <>
                <li>• Cleanse abilities can remove this effect early</li>
                <li>• Duration decreases by 1 each turn</li>
                <li>• Effect triggers at end of turn</li>
              </>
            )}
            {status.type === 'buff' && (
              <>
                <li>• Make the most of this while it lasts!</li>
                <li>• Duration decreases by 1 each turn</li>
                <li>• Effect triggers based on timing</li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const renderPassiveInfo = (passive: PassiveAbility) => {
    const triggerTypeLabels: { [key: string]: string } = {
      'on_damaged': 'When this creature is damaged',
      'on_attack': 'When this creature attacks',
      'on_status_applied': 'When a status is applied',
      'on_turn_start': 'At the start of each turn',
      'on_turn_end': 'At the end of each turn',
      'on_death': 'When this creature dies',
      'on_ally_death': 'When an ally dies',
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{passive.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-purple-100">{passive.name}</h3>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-500/30 text-yellow-200 border border-yellow-400/50">
              PASSIVE ABILITY
            </span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Description</h4>
          <p className="text-purple-100">{passive.description}</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">🎯 Trigger</h4>
          <p className="text-purple-100">
            {triggerTypeLabels[passive.trigger.type] || passive.trigger.type}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {passive.effect.value !== undefined && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Effect Value</div>
              <div className="text-lg font-bold text-purple-100">{passive.effect.value}</div>
            </div>
          )}
          {passive.effect.chance !== undefined && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">Trigger Chance</div>
              <div className="text-lg font-bold text-purple-100">{(passive.effect.chance * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>

        <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
          <h4 className="text-xs font-semibold text-yellow-300 mb-2">⚡ How It Works</h4>
          <ul className="text-xs text-yellow-100 space-y-1">
            {passive.trigger.type === 'on_damaged' && (
              <>
                <li>• Triggers whenever this creature takes damage</li>
                <li>• Effect applies automatically to the attacker</li>
                <li>• Can turn defense into offense!</li>
              </>
            )}
            {passive.trigger.type === 'on_status_applied' && (
              <>
                <li>• Triggers when a status effect is applied</li>
                <li>• Can spread status to nearby creatures</li>
                <li>• Only triggers if this creature has the passive</li>
              </>
            )}
            {passive.trigger.type === 'on_attack' && (
              <>
                <li>• Triggers when this creature attacks</li>
                <li>• Adds extra effects to your attacks</li>
                <li>• Makes every attack more powerful</li>
              </>
            )}
          </ul>
        </div>

        {passive.id === 'outbreak' && (
          <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
            <h4 className="text-xs font-semibold text-red-300 mb-2">🦠 Outbreak Special</h4>
            <p className="text-xs text-red-100">
              Only triggers when <strong>this creature</strong> is burned. When triggered, 
              has a chance to spread burn to one random ally. This uses <strong>LOCAL</strong> scope, 
              not global!
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/40 shadow-2xl shadow-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/30 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-200">
            {type === 'status' ? '📊 Status Effect' : '⚡ Passive Ability'}
          </h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-100 text-2xl leading-none hover:bg-purple-500/20 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'status' 
            ? renderStatusInfo(data as StatusEffect)
            : renderPassiveInfo(data as PassiveAbility)
          }
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-purple-500/30 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
