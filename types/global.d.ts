declare global {
  var menuUpdates: Array<{
    action: string;
    itemId?: string;
    itemName?: string;
    timestamp: number;
    [key: string]: any;
  }> | undefined;
}

export {}; 