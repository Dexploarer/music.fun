import React, { useState, useRef, useEffect } from 'react';
import { Square, Circle, Triangle, X, MessageSquare, Mail, Printer, Save, Trash, RotateCcw, RotateCw, Maximize as ArrowsMaximize, Minimize as ArrowsMinimize, Move } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Define types for our floor plan elements
interface FloorPlanItem {
  id: string;
  type: 'bench' | 'standingTable' | 'sittingTable' | 'booth' | 'chair' | 'stage' | 'danceFloor';
  x: number;
  y: number;
  rotation: number;
  width?: number;
  height?: number;
  label?: string;
}

// Define a modal for email sending
interface EmailModal {
  visible: boolean;
  email: string;
  message: string;
  sending: boolean;
}

const FloorPlanEditor: React.FC = () => {
  const [items, setItems] = useState<FloorPlanItem[]>([
    // Pre-defined stage
    { id: 'stage', type: 'stage', x: 400, y: 50, rotation: 0, width: 256, height: 80, label: 'Stage' },
    // Pre-defined dance floor
    { id: 'danceFloor', type: 'danceFloor', x: 400, y: 150, rotation: 0, width: 192, height: 192, label: 'Dance Floor' }
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'width' | 'height' | 'both' | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [emailModal, setEmailModal] = useState<EmailModal>({
    visible: false,
    email: '',
    message: 'Here is the seating arrangement for the upcoming event.',
    sending: false
  });
  
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  // Function to get selected item
  const getSelectedItem = () => {
    return items.find(item => item.id === selectedItemId);
  };

  // Seating elements that can be dragged from the sidebar
  const seatingElements = [
    { id: 'bench', label: 'Bench', icon: <Square size={14} /> },
    { id: 'standingTable', label: 'Standing Table', icon: <Triangle size={14} /> },
    { id: 'sittingTable', label: 'Sitting Table', icon: <Circle size={14} /> },
    { id: 'booth', label: 'Booth', icon: <Square size={14} /> },
    { id: 'chair', label: 'Chair', icon: <X size={14} /> },
  ];

  // Handle the start of dragging an element from the sidebar
  const handleDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData('itemType', itemType);
    setDraggedItemType(itemType);
  };

  // Handle the drag over event on the floor plan area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (floorPlanRef.current) {
      const rect = floorPlanRef.current.getBoundingClientRect();
      setDragPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Handle the drop event on the floor plan area
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('itemType') as 'bench' | 'standingTable' | 'sittingTable' | 'booth' | 'chair';
    
    if (!itemType || !floorPlanRef.current) return;
    
    const rect = floorPlanRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create a new item at the drop position
    const newItem: FloorPlanItem = {
      id: `${itemType}-${Date.now()}`,
      type: itemType,
      x,
      y,
      rotation: 0
    };
    
    // Add width and height for specific items
    switch (itemType) {
      case 'bench':
        newItem.width = 96;
        newItem.height = 24;
        break;
      case 'standingTable':
        newItem.width = 40;
        newItem.height = 40;
        break;
      case 'sittingTable':
        newItem.width = 48;
        newItem.height = 48;
        break;
      case 'booth':
        newItem.width = 64;
        newItem.height = 64;
        break;
      case 'chair':
        newItem.width = 24;
        newItem.height = 24;
        break;
      default:
        break;
    }
    
    setItems([...items, newItem]);
    setDraggedItemType(null);
  };

  // Handle selecting an item on the floor plan
  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };

  // Handle resizing of the stage or dance floor
  const handleResizeStart = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!selectedItemId) return;
    
    const selectedItem = items.find(item => item.id === selectedItemId);
    if (!selectedItem || !selectedItem.width || !selectedItem.height) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialSize({ width: selectedItem.width, height: selectedItem.height });
    setInitialPosition({ x: selectedItem.x, y: selectedItem.y });
    setInitialMousePosition({ x: e.clientX, y: e.clientY });
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };
  
  // Handle the resize during mouse movement
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !selectedItemId || !resizeDirection) return;
    
    const deltaX = e.clientX - initialMousePosition.x;
    const deltaY = e.clientY - initialMousePosition.y;
    
    setItems(prevItems => prevItems.map(item => {
      if (item.id === selectedItemId) {
        let newWidth = item.width || 0;
        let newHeight = item.height || 0;
        
        if (resizeDirection === 'width' || resizeDirection === 'both') {
          newWidth = Math.max(50, initialSize.width + deltaX);
        }
        
        if (resizeDirection === 'height' || resizeDirection === 'both') {
          newHeight = Math.max(50, initialSize.height + deltaY);
        }
        
        return {
          ...item,
          width: newWidth,
          height: newHeight
        };
      }
      return item;
    }));
  };
  
  // Stop the resizing operation
  const stopResize = () => {
    setIsResizing(false);
    setResizeDirection(null);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Handle dragging an existing item on the floor plan
  const handleItemDragStart = (e: React.DragEvent, item: FloorPlanItem) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedItemId(item.id);
    
    // Calculate the offset to maintain the item's position relative to the cursor
    if (floorPlanRef.current) {
      const rect = floorPlanRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - item.x;
      const offsetY = e.clientY - rect.top - item.y;
      e.dataTransfer.setData('offsetX', offsetX.toString());
      e.dataTransfer.setData('offsetY', offsetY.toString());
      e.dataTransfer.setData('itemId', item.id);
    }
  };

  // Handle dropping a dragged item to a new position
  const handleItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    
    if (!itemId || !floorPlanRef.current) return;
    
    const rect = floorPlanRef.current.getBoundingClientRect();
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
    
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;
    
    // Ensure the item stays within the bounds of the floor plan
    const boundedX = Math.max(0, Math.min(rect.width - 20, x));
    const boundedY = Math.max(0, Math.min(rect.height - 20, y));
    
    setItems(items.map(item => 
      item.id === itemId ? { ...item, x: boundedX, y: boundedY } : item
    ));
    
    setIsDragging(false);
  };

  // Handle background click to deselect items
  const handleBackgroundClick = () => {
    setSelectedItemId(null);
  };

  // Render different shapes based on item type
  const renderItem = (item: FloorPlanItem) => {
    const isSelected = item.id === selectedItemId;
    const baseClasses = `absolute cursor-move ${isSelected ? 'ring-2 ring-amber-500' : ''}`;
    let width = item.width;
    let height = item.height;
    
    // Default widths and heights if not specified
    if (!width || !height) {
      switch (item.type) {
        case 'bench':
          width = 96;
          height = 24;
          break;
        case 'standingTable':
          width = 40;
          height = 40;
          break;
        case 'sittingTable':
          width = 48;
          height = 48;
          break;
        case 'booth':
          width = 64;
          height = 64;
          break;
        case 'chair':
          width = 24;
          height = 24;
          break;
        case 'stage':
          width = 256;
          height = 80;
          break;
        case 'danceFloor':
          width = 192;
          height = 192;
          break;
        default:
          width = 40;
          height = 40;
      }
    }
    
    const style = { 
      left: `${item.x}px`, 
      top: `${item.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotate(${item.rotation}deg)`,
      transformOrigin: 'center',
    };
    
    switch (item.type) {
      case 'bench':
        return (
          <div 
            className={`${baseClasses} bg-zinc-700`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            {isSelected && <div className="absolute -top-5 left-0 text-xs text-white">Bench</div>}
          </div>
        );
      case 'standingTable':
        return (
          <div 
            className={`${baseClasses} flex items-center justify-center`} 
            style={{
              ...style,
              backgroundColor: 'transparent'
            }}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-zinc-700"></div>
            {isSelected && <div className="absolute -top-5 left-0 text-xs text-white">Standing Table</div>}
          </div>
        );
      case 'sittingTable':
        return (
          <div 
            className={`${baseClasses} bg-zinc-700 rounded-full`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            {isSelected && <div className="absolute -top-5 left-0 text-xs text-white">Sitting Table</div>}
          </div>
        );
      case 'booth':
        return (
          <div 
            className={`${baseClasses} bg-zinc-700`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            {isSelected && <div className="absolute -top-5 left-0 text-xs text-white">Booth</div>}
          </div>
        );
      case 'chair':
        return (
          <div 
            className={`${baseClasses} flex items-center justify-center`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            <X size={14} className="text-zinc-700" />
            {isSelected && <div className="absolute -top-5 left-0 text-xs text-white">Chair</div>}
          </div>
        );
      case 'stage':
        return (
          <div 
            className={`${baseClasses} bg-amber-700 flex items-center justify-center`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            <span className="text-xs text-white font-medium">Stage</span>
            
            {isSelected && (
              <>
                <div className="absolute -top-5 left-0 text-xs text-white flex items-center">
                  <Move size={12} className="mr-1" /> Drag to move
                </div>
                
                {/* Resize handles */}
                <div 
                  className="absolute -right-2 top-1/2 w-4 h-4 bg-amber-500 rounded-full cursor-e-resize transform -translate-y-1/2"
                  onMouseDown={(e) => handleResizeStart(e, 'width')}
                ></div>
                <div 
                  className="absolute left-1/2 -bottom-2 w-4 h-4 bg-amber-500 rounded-full cursor-s-resize transform -translate-x-1/2"
                  onMouseDown={(e) => handleResizeStart(e, 'height')}
                ></div>
                <div 
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-amber-500 rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'both')}
                ></div>
              </>
            )}
          </div>
        );
      case 'danceFloor':
        return (
          <div 
            className={`${baseClasses} bg-zinc-600/50 flex items-center justify-center border border-dashed border-zinc-500`} 
            style={style}
            draggable
            onDragStart={(e) => handleItemDragStart(e, item)}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            <span className="text-xs text-white font-medium">Dance Floor</span>
            
            {isSelected && (
              <>
                <div className="absolute -top-5 left-0 text-xs text-white flex items-center">
                  <Move size={12} className="mr-1" /> Drag to move
                </div>
                
                {/* Resize handles */}
                <div 
                  className="absolute -right-2 top-1/2 w-4 h-4 bg-amber-500 rounded-full cursor-e-resize transform -translate-y-1/2"
                  onMouseDown={(e) => handleResizeStart(e, 'width')}
                ></div>
                <div 
                  className="absolute left-1/2 -bottom-2 w-4 h-4 bg-amber-500 rounded-full cursor-s-resize transform -translate-x-1/2"
                  onMouseDown={(e) => handleResizeStart(e, 'height')}
                ></div>
                <div 
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-amber-500 rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'both')}
                ></div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Handle deleting a selected item
  const handleDeleteItem = () => {
    if (selectedItemId) {
      // Don't allow deleting the stage or dance floor
      if (selectedItemId === 'stage' || selectedItemId === 'danceFloor') {
        toast.error("Cannot delete the stage or dance floor");
        return;
      }
      
      setItems(items.filter(item => item.id !== selectedItemId));
      setSelectedItemId(null);
    }
  };

  // Handle rotating a selected item
  const handleRotateItem = (direction: 'clockwise' | 'counterclockwise') => {
    if (selectedItemId) {
      setItems(items.map(item => {
        if (item.id === selectedItemId) {
          const rotationChange = direction === 'clockwise' ? 45 : -45;
          return { ...item, rotation: item.rotation + rotationChange };
        }
        return item;
      }));
    }
  };

  // Print the floor plan
  const handlePrint = () => {
    if (!floorPlanRef.current) return;
    
    // Create a new iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    printFrameRef.current = iframe;
    
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;
    
    // Create the print content
    iframeDocument.write(`
      <html>
        <head>
          <title>Floor Plan - The Train Station</title>
          <style>
            body {
              font-family: sans-serif;
              margin: 0;
              padding: 20px;
            }
            .container {
              position: relative;
              width: 800px;
              height: 600px;
              border: 1px solid #ccc;
              margin: 0 auto;
              background-color: #f8f8f8;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .item {
              position: absolute;
              box-sizing: border-box;
            }
            .bench {
              background-color: #555;
            }
            .standingTable {
              width: 0;
              height: 0;
              border-left: 20px solid transparent;
              border-right: 20px solid transparent;
              border-bottom: 40px solid #555;
            }
            .sittingTable {
              background-color: #555;
              border-radius: 50%;
            }
            .booth {
              background-color: #555;
            }
            .chair {
              color: #555;
            }
            .stage {
              background-color: #b45309;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            }
            .danceFloor {
              background-color: rgba(75, 85, 99, 0.3);
              border: 2px dashed #555;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #555;
              font-weight: bold;
              font-size: 12px;
            }
            footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>The Train Station - Floor Plan</h1>
          <div class="container">
            ${items.map(item => {
              const style = `
                left: ${item.x}px;
                top: ${item.y}px;
                width: ${item.width || 40}px;
                height: ${item.height || 40}px;
                transform: rotate(${item.rotation}deg);
                transform-origin: center;
              `;
              
              switch (item.type) {
                case 'bench':
                  return `<div class="item bench" style="${style}"></div>`;
                case 'standingTable':
                  return `<div style="position: absolute; left: ${item.x}px; top: ${item.y}px; transform: rotate(${item.rotation}deg);">
                    <div class="standingTable"></div>
                  </div>`;
                case 'sittingTable':
                  return `<div class="item sittingTable" style="${style}"></div>`;
                case 'booth':
                  return `<div class="item booth" style="${style}"></div>`;
                case 'chair':
                  return `<div class="item chair" style="${style}">X</div>`;
                case 'stage':
                  return `<div class="item stage" style="${style}">Stage</div>`;
                case 'danceFloor':
                  return `<div class="item danceFloor" style="${style}">Dance Floor</div>`;
                default:
                  return '';
              }
            }).join('')}
          </div>
          <footer>
            <p>Printed on ${new Date().toLocaleString()}</p>
            <p>The Train Station - 4671 5th Street, Corbin, KY</p>
          </footer>
        </body>
      </html>
    `);
    
    iframeDocument.close();
    
    // Print the iframe content
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
        printFrameRef.current = null;
      }, 1000);
    }, 500);
  };

  // Open the email modal
  const handleEmailOpen = () => {
    setEmailModal({
      ...emailModal,
      visible: true
    });
  };

  // Close the email modal
  const handleEmailClose = () => {
    setEmailModal({
      ...emailModal,
      visible: false
    });
  };

  // Handle email input changes
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailModal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Send the floor plan via email
  const handleEmailSend = () => {
    // In a real app, this would send the floor plan to the server for email processing
    setEmailModal(prev => ({ ...prev, sending: true }));
    
    // Simulate sending
    setTimeout(() => {
      setEmailModal({
        visible: false,
        email: '',
        message: 'Here is the seating arrangement for the upcoming event.',
        sending: false
      });
      
      // Show success message
      toast.success('Floor plan has been sent to ' + emailModal.email);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Interactive Floor Plan</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="bg-zinc-700 text-white px-3 py-1 rounded text-xs hover:bg-zinc-600 flex items-center"
          >
            <Printer size={14} className="mr-1" /> Print
          </button>
          <button 
            onClick={handleEmailOpen}
            className="bg-zinc-700 text-white px-3 py-1 rounded text-xs hover:bg-zinc-600 flex items-center"
          >
            <Mail size={14} className="mr-1" /> Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sidebar with seating elements */}
        <div className="lg:col-span-1 bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Seating Elements</h3>
          <div className="space-y-2">
            {seatingElements.map((element) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element.id)}
                className="bg-zinc-700 text-white p-2 rounded cursor-grab flex items-center"
              >
                <div className="mr-2">{element.icon}</div>
                <span className="text-xs">{element.label}</span>
              </div>
            ))}
          </div>
          
          {/* Item controls */}
          {selectedItemId && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-white">Item Controls</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleRotateItem('counterclockwise')}
                  className="bg-zinc-700 text-white px-2 py-1 rounded text-xs hover:bg-zinc-600 flex items-center"
                >
                  <RotateCcw size={12} className="mr-1" /> Rotate
                </button>
                <button 
                  onClick={() => handleRotateItem('clockwise')}
                  className="bg-zinc-700 text-white px-2 py-1 rounded text-xs hover:bg-zinc-600 flex items-center"
                >
                  <RotateCw size={12} className="mr-1" /> Rotate
                </button>
                <button 
                  onClick={handleDeleteItem}
                  className="bg-red-700 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center"
                  disabled={selectedItemId === 'stage' || selectedItemId === 'danceFloor'}
                >
                  <Trash size={12} className="mr-1" /> Delete
                </button>
              </div>
              
              {(selectedItemId === 'stage' || selectedItemId === 'danceFloor') && (
                <div className="mt-2 bg-zinc-700 p-2 rounded text-xs text-white">
                  <p className="flex items-center">
                    <ArrowsMaximize size={12} className="mr-1" /> 
                    Drag corner/edge handles to resize
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-zinc-700 rounded-lg">
            <h4 className="text-xs font-semibold text-white mb-2">Instructions</h4>
            <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
              <li>Drag items from this panel onto the floor plan</li>
              <li>Click an item to select it for editing</li>
              <li>Drag placed items to reposition them</li>
              <li>The stage and dance floor can be resized</li>
              <li>Use the Print button to print the layout</li>
              <li>Use the Email button to send the layout</li>
            </ul>
          </div>
        </div>
        
        {/* Floor plan area */}
        <div 
          className="lg:col-span-4 bg-zinc-900 rounded-lg relative"
          style={{ height: '600px', overflow: 'hidden' }}
        >
          <div 
            ref={floorPlanRef}
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundColor: '#222',
              backgroundPosition: 'center center'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={(e) => e.preventDefault()}
            onClick={handleBackgroundClick}
          >
            {/* Render all floor plan items */}
            {items.map(item => renderItem(item))}
            
            {/* Show ghost element when dragging from sidebar */}
            {draggedItemType && (
              <div 
                className="absolute opacity-50 bg-amber-500 w-8 h-8 rounded-full" 
                style={{ 
                  left: `${dragPosition.x - 16}px`, 
                  top: `${dragPosition.y - 16}px`,
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>
          
          {/* Floor plan controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              onClick={() => {
                // Reset to default layout
                setItems([
                  { id: 'stage', type: 'stage', x: 400, y: 50, rotation: 0, width: 256, height: 80, label: 'Stage' },
                  { id: 'danceFloor', type: 'danceFloor', x: 400, y: 150, rotation: 0, width: 192, height: 192, label: 'Dance Floor' }
                ]);
                setSelectedItemId(null);
              }}
              className="bg-zinc-700 text-white px-3 py-1 rounded text-xs hover:bg-zinc-600 flex items-center"
            >
              <RotateCcw size={12} className="mr-1" /> Reset
            </button>
            <button 
              onClick={() => {
                toast.success("Floor plan saved successfully!");
              }}
              className="bg-amber-600 text-white px-3 py-1 rounded text-xs hover:bg-amber-500 flex items-center"
            >
              <Save size={12} className="mr-1" /> Save Layout
            </button>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-zinc-800/70 p-2 rounded text-xs text-white max-w-xs">
            <div className="flex items-start">
              <MessageSquare size={12} className="mr-1 mt-0.5" />
              <div>
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Drag items from the left panel onto the floor plan</li>
                  <li>Click an item to select it</li>
                  <li>Use controls to rotate or delete selected items</li>
                  <li>Drag items to reposition them</li>
                  <li>Stage and dance floor can be resized</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-2">Floor Plan Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-700 mr-2"></div>
            <span className="text-xs text-white">Stage</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-zinc-600/50 border border-dashed border-zinc-500 mr-2"></div>
            <span className="text-xs text-white">Dance Floor</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-zinc-700 mr-2"></div>
            <span className="text-xs text-white">Bench/Booth</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-zinc-700 rounded-full mr-2"></div>
            <span className="text-xs text-white">Sitting Table</span>
          </div>
          <div className="flex items-center">
            <Triangle size={14} className="text-zinc-700 mr-2" />
            <span className="text-xs text-white">Standing Table</span>
          </div>
          <div className="flex items-center">
            <X size={14} className="text-zinc-700 mr-2" />
            <span className="text-xs text-white">Chair</span>
          </div>
        </div>
      </div>
      
      {/* Email Modal */}
      {emailModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Send Floor Plan via Email</h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={emailModal.email}
                  onChange={handleEmailInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 py-2 px-3 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={emailModal.message}
                  onChange={handleEmailInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 py-2 px-3 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Add a message to accompany the floor plan..."
                />
              </div>
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={handleEmailClose}
                className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSend}
                disabled={!emailModal.email || emailModal.sending}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {emailModal.sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden iframe for printing */}
      <iframe ref={printFrameRef} style={{ display: 'none' }} title="Print Frame"></iframe>
    </div>
  );
};

export default FloorPlanEditor;