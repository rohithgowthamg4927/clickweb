import boto3
import time

def lambda_handler(event, context):
    
    client = boto3.client('athena')
    
    try:
        print("Running query")
        response = client.start_query_execution(
            QueryString='MSCK REPAIR TABLE clickevents',
            QueryExecutionContext={
                'Database': 'clickevents-db'
            },
            WorkGroup='clickevents-wg'
        )
        
        query_execution_id = response['QueryExecutionId']
        print(f"Query execution started with ID: {query_execution_id}")
        
        status = 'RUNNING' #set status to running initially
        max_retries = 10
        while max_retries > 0 and status in ['RUNNING', 'QUEUED']:
            max_retries -= 1
            response = client.get_query_execution(QueryExecutionId=query_execution_id)
            status = response['QueryExecution']['Status']['State']
            print(f"Query status: {status}, remaining retries: {max_retries}")
            if status in ['RUNNING', 'QUEUED']:
                time.sleep(3)
        
        print(f"Query completed with final status: {status}")
        if status == 'SUCCEEDED':
            print("Table repaired with fresh data successfully")
        else:
            print(f"Query status: {status}")
            
        return {
            'statusCode': 200,
            'queryExecutionId': query_execution_id,
            'status': status
        }
    except Exception as e:
        print(f"Error executing Athena query: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e)
        }
