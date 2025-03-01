import json
import os
import pytz
import boto3
import pandas as pd
from datetime import datetime
import pyarrow as pa
import pyarrow.parquet as pq

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

TABLE = os.getenv('TABLE')
BUCKET = os.getenv('BUCKET')

ist = pytz.timezone('Asia/Kolkata')

def lambda_handler(event, context):
    print("Exporting today's data to S3 in Parquet format.")

    cur_time = datetime.now(ist)
    year = cur_time.strftime('%Y')
    month = cur_time.strftime('%m')
    day = cur_time.strftime('%d')

    table = dynamodb.Table(TABLE)

    today_data = []
    last_evaluated_key = None

    while True:
        if last_evaluated_key:
            response = table.scan(ExclusiveStartKey=last_evaluated_key)
        else:
            response = table.scan()

        items = response.get('Items', [])
        today_data.extend([
            item for item in items
            if 'timestamp' in item and item['timestamp'].startswith(f"{year}-{month}-{day}")
        ])

        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break

    if not today_data:
        print(f"No records for {year}-{month}-{day}, skipping export")
        return {"status": "skipped", "message": f"No records for today[{year}-{month}-{day}]"}

    df = pd.DataFrame(today_data)

    table = pa.Table.from_pandas(df)
    parquet_buffer = pa.BufferOutputStream()
    pq.write_table(table, parquet_buffer)

    s3_key = f"year={year}/month={month}/day={day}/dynamodb_export.parquet"

    try:
        s3.put_object(
            Bucket=BUCKET,
            Key=s3_key,
            Body=parquet_buffer.getvalue().to_pybytes(),
            ContentType='application/octet-stream'
        )

        print(f"Successfully exported {len(today_data)} records to S3 in Parquet format.")
        return {"status": "success", "message": f"Exported {len(today_data)} records to S3."}

    except Exception as e:
        print(f"Error uploading data to S3. {str(e)}")
        return {"status": "error", "message": str(e)}
