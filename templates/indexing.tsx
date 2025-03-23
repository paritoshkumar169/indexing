import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useIndexingConfig } from "@/hooks/use-indexing-config";
import { useDatabaseConnections } from "@/hooks/use-database-connections";
import { NewUserIndexingConfig } from "@/types";

interface DataIndexingPanelProps {
  userId: number;
}

export default function DataIndexingPanel({ userId }: DataIndexingPanelProps) {
  const { 
    indexingTypes, 
    userConfigs, 
    isLoading, 
    saveConfigs, 
    isSaving 
  } = useIndexingConfig(userId);
  
  const { connections } = useDatabaseConnections(userId);
  
  // Selected state for indexing types
  const [selectedTypes, setSelectedTypes] = useState<Record<number, boolean>>({});
  
  // Selected database connection
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);
  
  // Initialize selected types based on user configs when they load
  useEffect(() => {
    if (userConfigs && indexingTypes) {
      const initialSelected: Record<number, boolean> = {};
      
      indexingTypes.forEach(type => {
        // Check if user has this type configured
        const hasConfig = userConfigs.some(
          config => config.indexingTypeId === type.id && config.active
        );
        initialSelected[type.id] = hasConfig;
      });
      
      setSelectedTypes(initialSelected);
    }
  }, [userConfigs, indexingTypes]);
  
  // When database connections load, select the first one by default
  useEffect(() => {
    if (connections && connections.length > 0 && !selectedDbId) {
      setSelectedDbId(connections[0].id);
    }
  }, [connections, selectedDbId]);
  
  // Toggle selection for an indexing type
  const toggleSelection = (typeId: number) => {
    setSelectedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };
  
  // Save configuration
  const handleSave = () => {
    if (!selectedDbId) {
      alert("Please select a database connection first");
      return;
    }
    
    // Create configs for all selected types
    const configs: NewUserIndexingConfig[] = [];
    
    Object.entries(selectedTypes).forEach(([typeIdStr, isSelected]) => {
      if (isSelected) {
        const typeId = parseInt(typeIdStr);
        configs.push({
          userId,
          indexingTypeId: typeId,
          databaseConnectionId: selectedDbId
        });
      }
    });
    
    if (configs.length === 0) {
      alert("Please select at least one data type to index");
      return;
    }
    
    saveConfigs(configs);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow lg:col-span-2 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow lg:col-span-2">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Data Indexing Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select the blockchain data types you want to index into your database
        </p>
      </div>
      <div className="p-6">
        {connections && connections.length > 0 ? (
          <>
            {/* Database selection */}
            <div className="mb-4">
              <Label htmlFor="db-select">Target Database</Label>
              <select
                id="db-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={selectedDbId || ""}
                onChange={(e) => setSelectedDbId(parseInt(e.target.value))}
              >
                {connections.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.hostname})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Indexing type selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indexingTypes?.map(type => (
                <div 
                  key={type.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary-400 hover:shadow-md relative group ${
                    selectedTypes[type.id] ? 'border-primary-400 bg-primary-50' : ''
                  }`}
                  onClick={() => toggleSelection(type.id)}
                >
                  <div className="absolute top-3 right-3">
                    <Checkbox 
                      id={`index-${type.id}`}
                      checked={selectedTypes[type.id] || false}
                      onCheckedChange={() => toggleSelection(type.id)}
                    />
                  </div>
                  <Label 
                    htmlFor={`index-${type.id}`}
                    className="cursor-pointer block"
                  >
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        type.name === 'NFT Bids' ? 'bg-purple-100' :
                        type.name === 'Token Prices' ? 'bg-green-100' :
                        type.name === 'Wallet Activity' ? 'bg-blue-100' :
                        'bg-amber-100'
                      }`}>
                        <span className={`material-icons ${
                          type.name === 'NFT Bids' ? 'text-purple-600' :
                          type.name === 'Token Prices' ? 'text-green-600' :
                          type.name === 'Wallet Activity' ? 'text-blue-600' :
                          'text-amber-600'
                        }`}>
                          {type.icon}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Creates tables: <span className="font-mono">
                        {Object.keys(type.tablesToCreate).join(', ')}
                      </span></p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                <span className="material-icons mr-2 text-sm">save</span>
                Save Configuration
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              Please add a database connection before configuring indexing.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/databases'}
            >
              Add Database Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
