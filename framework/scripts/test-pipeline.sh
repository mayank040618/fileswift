#!/bin/bash

# Configuration
API_URL="http://localhost:8080"
TOOL_ID="pdf-to-word"
TEST_FILE="test_smoke.pdf"

# 1. Create Dummy PDF if not exists
if [ ! -f "$TEST_FILE" ]; then
    echo "Creating dummy PDF..."
    # We need a valid PDF. We can try to download one or echo minimal PDF structure
    # Minimal PDF 1.4
cat > "$TEST_FILE" <<EOF
%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /MediaBox [0 0 595 842] /Parent 2 0 R /Resources <<>> /Contents 4 0 R>> endobj
4 0 obj <</Length 22>> stream
BT /F1 24 Tf 50 750 Td (Fileswift Smoke Test) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000224 00000 n
trailer <</Size 5 /Root 1 0 R>>
startxref
296
%%EOF
EOF
fi

echo "=== 1. Uploading File ($TOOL_ID) ==="
UPLOAD_RESP=$(curl -s -F "file=@$TEST_FILE" "$API_URL/api/tools/$TOOL_ID/upload")
echo "Response: $UPLOAD_RESP"

JOB_ID=$(echo $UPLOAD_RESP | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo "❌ Upload Failed!"
    exit 1
fi

echo "✅ Job ID: $JOB_ID"

echo "=== 2. Polling Status ==="
STATUS="processing"
ATTEMPTS=0
while [ "$STATUS" != "completed" ] && [ "$STATUS" != "failed" ] && [ $ATTEMPTS -lt 20 ]; do
    sleep 1
    JOB_RESP=$(curl -s "$API_URL/api/jobs/$JOB_ID")
    STATUS=$(echo $JOB_RESP | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    MESSAGE=$(echo $JOB_RESP | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    echo "Attempt $ATTEMPTS: Status = $STATUS ($MESSAGE)"
    ATTEMPTS=$((ATTEMPTS+1))
done

if [ "$STATUS" == "failed" ]; then
    echo "❌ Job Failed!"
    exit 1
fi

if [ "$STATUS" != "completed" ]; then
    echo "❌ Job Timed Out!"
    exit 1
fi

echo "✅ Job Completed!"
DOWNLOAD_URL=$(echo $JOB_RESP | sed -E 's/.*"downloadUrl":"([^"]+)".*/\1/')
# Decode JSON string if needed (simple sed fallback)
# But standard json output usually clean. 

echo "=== 3. verifying Download ==="
echo "URL: $DOWNLOAD_URL"

HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" "$DOWNLOAD_URL")
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Download Verified (200 OK)"
    rm "$TEST_FILE"
    exit 0
else
    echo "❌ Download Failed (Status $HTTP_CODE)"
    exit 1
fi
