import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FacilityItem } from '../types';
import ImageUpload from './ImageUpload';
import { resolveUrl } from '../lib/utils';

interface FacilityDetailsEditorProps {
  facilities: FacilityItem[];
  onChange: (f: FacilityItem[]) => void;
}

const FacilityDetailsEditor: React.FC<FacilityDetailsEditorProps> = ({ facilities, onChange }) => {
  const [newFacility, setNewFacility] = useState<Partial<FacilityItem>>({
    name: '',
    rate: 0,
    unit: '',
    photoUrl: ''
  });

  const handleAdd = () => {
    if (!newFacility.name || !newFacility.unit) {
      toast.error('Facility Name and Unit are required');
      return;
    }
    const item: FacilityItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFacility.name!,
      rate: newFacility.rate || 0,
      unit: newFacility.unit!,
      photoUrl: newFacility.photoUrl || ''
    };
    onChange([...facilities, item]);
    setNewFacility({ name: '', rate: 0, unit: '', photoUrl: '' });
  };

  const handleRemove = (id: string) => {
    onChange(facilities.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Facility Name</label>
            <input 
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 uppercase"
              placeholder="e.g. Catering"
              value={newFacility.name}
              onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Rate (₹)</label>
            <input 
              type="number"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-bold"
              placeholder="500"
              value={newFacility.rate}
              onChange={(e) => setNewFacility({...newFacility, rate: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Unit</label>
            <input 
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 uppercase"
              placeholder="per plate / per set"
              value={newFacility.unit}
              onChange={(e) => setNewFacility({...newFacility, unit: e.target.value})}
            />
          </div>
          <div>
             <ImageUpload 
              label="Photo" 
              onUpload={(url) => setNewFacility(prev => ({...prev, photoUrl: (Array.isArray(url) ? url[0] : url) || ''}))}
            />
             {newFacility.photoUrl && (
               <div className="relative w-10 h-10 mt-1">
                 <img src={resolveUrl(newFacility.photoUrl)} className="w-full h-full object-cover rounded-lg border" referrerPolicy="no-referrer" />
                 <button onClick={() => setNewFacility(prev => ({...prev, photoUrl: ''}))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5">
                   <X size={10} />
                 </button>
               </div>
             )}
          </div>
        </div>
        <button 
          type="button"
          onClick={handleAdd}
          className="w-full bg-orange-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add to List</span>
        </button>
      </div>

      {facilities.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sr No.</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Facility Name</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rate</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Unit</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Photo</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facilities.map((f, i) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-xs font-black text-gray-900 uppercase">{f.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700 text-center">₹{f.rate}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-500 text-center uppercase">{f.unit}</td>
                  <td className="px-4 py-3 text-center">
                    {f.photoUrl && <img src={resolveUrl(f.photoUrl)} className="w-8 h-8 object-cover rounded mx-auto border" referrerPolicy="no-referrer" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      type="button"
                      onClick={() => handleRemove(f.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacilityDetailsEditor;
