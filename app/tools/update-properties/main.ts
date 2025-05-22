import * as fs from 'fs/promises';

/**
 * Updates or adds key-value pairs in a properties file.
 * @param filePath - Path to the properties file
 * @param updates - Object containing key-value pairs to update or add
 * @returns Promise that resolves when the file is updated
 */
async function updateProperties(filePath: string, updates: Record<string, string>): Promise<void> {
    try {
        // Read the existing file content
        let content = '';
        try {
            content = await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            // If file doesn't exist, we'll create a new one
            console.log('Creating new properties file');
            console.error(error);
        }

        // Parse existing properties into a map
        const properties = new Map<string, string>();
        const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        for (const line of lines) {
            const [key, value] = line.split('=', 2).map(part => part.trim());
            if (key && value) {
                properties.set(key, value);
            }
        }

        // Apply updates
        for (const [key, value] of Object.entries(updates)) {
            properties.set(key, value);
        }

        // Generate new content
        const newContent = Array.from(properties.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Write back to file
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log('Properties file updated successfully');
    } catch (error) {
        throw new Error(`Failed to update properties file: ${error}`);
    }
}

// Example usage
async function main() {
    try {
        const updates = {
            'database.url': 'jdbc:mysql://localhost:3306/mydb',
            'database.user': 'admin',
            'new.property': 'newValue'
        };
        await updateProperties('config.properties', updates);
    } catch (error) {
        console.error(error);
    }
}

if (require.main === module) {
    main();
}

export { updateProperties };