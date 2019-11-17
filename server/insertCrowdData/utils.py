MINUTE_TIME_STAMP = 60*1000
    
def remove_duplicates(items, key):
    """
    Remove all duplicates from a list of dict (items), based on unique keys
    """
    
    clean_items = []
    for i, item in enumerate(items):
        if not any(item[key] == item_[key] for item_ in items[i+1:]):
            clean_items.append(item)
            
    return clean_items
    
def raw_to_count(items):
    """
    Estimate number of users based on sniffed mac data
    """
    
    unique_items = remove_duplicates(items, key='mac')
    return len(unique_items)
    
    
def update_count(table, items, deviceId, timestamp):
    """
    Update count table
    """
    count = raw_to_count(items)
   
    
    table.put_item(
        Item={
            'timestamp': timestamp,
            'deviceId': deviceId,
            'count': count
        }
    )

        
        

        
        
    
    
    
    
    
    
    
    
    
    