export function bulkTransferFields(
    target: any,
    source: any,
    fieldConfigs: Array<{ 
        fieldName: string; 
        emptyValue: any; 
        condition?: (targetVal: any, sourceVal: any) => boolean; 
        setEmpty?: boolean;
        nested?: boolean
    }>
): void {
    fieldConfigs.forEach(config => {
        const condition = config.condition || ((targetVal) => !targetVal);
        
        let targetValue, sourceValue;
        
        if (config.nested) {
            targetValue = getNestedValue(target, config.fieldName);
            sourceValue = getNestedValue(source, config.fieldName);
        } else {
            targetValue = target[config.fieldName];
            sourceValue = source[config.fieldName];
        }
        
        if (condition(targetValue, sourceValue)) {
            if (config.nested) {
                setNestedValue(target, config.fieldName, sourceValue);
            } else {
                target[config.fieldName] = sourceValue;
            }
        }

        if (config.setEmpty !== false) {
            if (config.nested) {
                setNestedValue(source, config.fieldName, config.emptyValue);
            } else {
                source[config.fieldName] = config.emptyValue;
            }
        }
    });
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
        if (current[key] === undefined || current[key] === null) {
            current[key] = {};
        }
        return current[key];
    }, obj);
    target[lastKey] = value;
}
