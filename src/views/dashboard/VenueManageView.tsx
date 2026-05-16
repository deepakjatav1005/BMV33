import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Venue } from '../../types';

interface VenueManageViewProps {
  user: any;
  venues: Venue[];
  onUpdate?: () => void;
}

const VenueManageView: React.FC<VenueManageViewProps> = ({ user, venues, onUpdate }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('venues').delete().eq('id', id);
      if (error) throw error;
      toast.success('Venue deleted');
      setDeletingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to delete venue');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Venues</h2>
        <button 
          onClick={() => navigate('/add-venue')}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={18} />
          <span>Add Venue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map(v => (
          <div key={v.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{v.name}</h3>
              <p className="text-sm text-gray-500">{v.address}, {v.district}, {v.state}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => navigate(`/edit-venue/${v.id}`)} className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                <Edit2 size={18} />
              </button>
              {deletingId === v.id ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeletingId(v.id)} 
                  className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {venues.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No venues added yet.</p>}
      </div>
    </div>
  );
};

export default VenueManageView;
