import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'hermasai';

// Auto-detect environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const useLocal = isDevelopment || isLocalhost;

// DynamoDB Client Configuration
const clientConfig = useLocal ? {
  region: 'local',
  endpoint: 'http://localhost:8000', // Standard DynamoDB Local port
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
} : {
  region: 'us-east-1' // Default AWS region for production
};

// Debug logging
console.log('DynamoDB Configuration:', {
  useLocal,
  isDevelopment,
  isLocalhost: typeof window !== 'undefined' ? window.location.hostname === 'localhost' : 'server-side',
  region: clientConfig.region,
  endpoint: clientConfig.endpoint || 'AWS managed'
});

const client = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(client);

// Create table if it doesn't exist (mainly for local development)
export async function ensureTableExists(): Promise<void> {
  try {
    await client.send(new DescribeTableCommand({
      TableName: TABLE_NAME
    }));
    console.log(`Table ${TABLE_NAME} exists`);
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Creating table ${TABLE_NAME}...`);
      await client.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          {
            AttributeName: 'configKey',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'configKey',
            AttributeType: 'S'
          }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }));
      console.log(`Table ${TABLE_NAME} created successfully`);
    } else {
      console.error('Error checking/creating table:', error);
      throw error;
    }
  }
}

// Configuration interface
export interface ConfigData {
  pythonServicesUrl: string;
  adminUsername: string;
  adminPassword: string;
  lastUpdated: string;
  updatedBy: string;
}

// Default configuration
const DEFAULT_CONFIG: ConfigData = {
  pythonServicesUrl: 'http://127.0.0.1:8000',
  adminUsername: 'admin',
  adminPassword: 'hermasai2024', // Default password - should be changed via admin panel
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

// Read configuration from DynamoDB
export async function readConfig(): Promise<ConfigData> {
  try {
    await ensureTableExists();

    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        configKey: 'main'
      }
    }));

    if (response.Item) {
      console.log('Configuration loaded from DynamoDB successfully');
      return response.Item as ConfigData;
    } else {
      // No config found, create default
      console.log('No configuration found, creating default config');
      await writeConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error('Error reading config from DynamoDB:', error);
    console.log('Using fallback default configuration');

    // In production, if DynamoDB fails, we still want to provide working defaults
    return {
      ...DEFAULT_CONFIG,
      pythonServicesUrl: 'http://127.0.0.1:8000', // Safe default for local development
    };
  }
}

// Write configuration to DynamoDB
export async function writeConfig(config: ConfigData): Promise<void> {
  try {
    await ensureTableExists();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        configKey: 'main',
        ...config
      }
    }));

    console.log('Configuration saved to DynamoDB successfully');
  } catch (error) {
    console.error('Error writing config to DynamoDB:', error);
    throw error;
  }
}

// Health check for DynamoDB connection
export async function checkDynamoDBHealth(): Promise<boolean> {
  try {
    await ensureTableExists();
    return true;
  } catch (error) {
    console.error('DynamoDB health check failed:', error);
    return false;
  }
}