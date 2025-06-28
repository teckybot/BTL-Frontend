import React from 'react';
import { Card, Result, Button } from 'antd';

const QualifierSuccess = () => {
  return (
    <Card style={{ maxWidth: 500, margin: '2rem auto' }}>
      <Result
        status="success"
        title="Registration Complete!"
        subTitle="You have successfully registered for the Qualifier round."
        extra={[
          <Button type="primary" key="rules">Download Rules & Guidelines</Button>,
          <Button key="pdf">Download Team PDF</Button>
        ]}
      />
    </Card>
  );
};

export default QualifierSuccess; 