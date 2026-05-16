import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ServiceProvider } from '../../types';

interface ServicesManageViewProps {
  user: any;
  services: ServiceProvider[];
  onUpdate?: () => void;
}

const ServicesManageView: React.FC<ServicesManageViewProps> = ({ user, services, onUpdate }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service deleted');
      setDeletingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Services</h2>
        <button 
          onClick={() => navigate('/add-service')}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.serviceType} • {s.district}, {s.state}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => navigate(`/edit-service/${s.id}`)} className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                <Edit2 size={18} />
              </button>
              {deletingId === s.id ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(s.id)}
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
                  onClick={() => setDeletingId(s.id)} 
                  className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No services added yet.</p>}
      </div>
    </div>
  );
};

export default ServicesManageView;
