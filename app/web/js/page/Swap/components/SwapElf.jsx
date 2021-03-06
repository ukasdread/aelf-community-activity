/* From start */
import React from 'react';
import { Button, Form, Input, message, Card, Select } from 'antd';
import { Link } from 'react-router';
import {getMerklePathFromOtherChain} from '../../../utils/getMerklePath';

import {NightElfCheck} from '../../../utils/NightElf/NightElf';
import { LOGIN_INFO, SWAP_CONTRACT_ADDRESS, EXPLORER_URL } from '../../../constant/constant';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
/* From end */
// export default function renderSwapElf(props) {
export default class SwapElf extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      swappedLink: null,
      swappedTxHash: null
    };
    this.onFinish = this.onFinish.bind(this);
    this.onFinishFailed = this.onFinishFailed.bind(this);
  }

  async onFinish () {
    const swapInfo = this.props;
    try {
      // const {swapId, originAmount, merklePathBytes, merklePathBool, receiverAddress, uniqueId} = values;

      const swapId = '' + swapInfo.swapId;
      const originAmount = swapInfo.swapELFReceiptInfo[2];
      const uniqueId = swapInfo.swapELFReceiptInfo[0];
      const receiverAddress = swapInfo.swapELFReceiptInfo[1];
      const merklePathBytes = swapInfo.swapELFMerklePathInfo[0].join(',');
      const merklePathBool = swapInfo.swapELFMerklePathInfo[1].join(',');

      const merklePath = getMerklePathFromOtherChain(merklePathBytes.trim(), merklePathBool.trim());
      const swapTokenInput = {
        swapId,
        originAmount: originAmount.trim(),
        merklePath,
        receiverAddress: receiverAddress.trim(),
        uniqueId: uniqueId.trim(),
      };

      await NightElfCheck.getInstance().check;
      const aelf = NightElfCheck.initAelfInstanceByExtension();
      const accountInfo = await aelf.login(LOGIN_INFO);

      if (accountInfo.error) {
        message.warning(accountInfo.errorMessage.message || accountInfo.errorMessage);
        return;
      }

      const chainStatus = await aelf.chain.getChainStatus();
      const wallet = {
        address: JSON.parse(accountInfo.detail).address
      };
      // It is different from the wallet created by Aelf.wallet.getWalletByPrivateKey();
      // There is only one value named address;
      const swapContract = await aelf.chain.contractAt(
        SWAP_CONTRACT_ADDRESS,
        wallet
      );
      const swapResult = await swapContract.SwapToken(swapTokenInput);
      if (swapResult.error) {
        message.warning(swapResult.errorMessage.message || swapResult.errorMessage);
        return;
      }
      const {TransactionId} = swapResult.result || swapResult;
      const explorerHref = `${EXPLORER_URL}/tx/${TransactionId}`;
      // const txIdHTML = <div>
      //   <span>Transaction ID: {TransactionId}</span>
      //   <br/>
      //   <a target='_blank' href={explorerHref}>Turn to aelf explorer to get the information of this transaction</a>
      // </div>;
      // message.success(txIdHTML, 16);
      // console.log('swapTokenInput', swapTokenInput);

      this.setState({
        swappedLink: explorerHref,
        swappedTxHash: TransactionId
      });
    } catch(e) {
      message.error(e.message || (e.errorMessage && e.errorMessage.message) || 'Swap failed', 3);
      console.log('error', e);
    }
  };

  async onFinishFailed (errorInfo) {
    console.log('Failed:', errorInfo);
  };

  render() {

    const swapInfo = this.props;
    const {swappedLink, swappedTxHash} = this.state;

    console.log('swapInfo.swapId: ', swapInfo.swapId);

    return (
      <Card
        className='hover-cursor-auto'
        hoverable
        title='Step3: Swap Test Token'>
        <div className='section-content swap-form-container'>
          <Form
            {...layout}
            name="basic"
            initialValues={{
              swapId: '' + swapInfo.swapId,
              originAmount: swapInfo.swapELFReceiptInfo[2],
              uniqueId: swapInfo.swapELFReceiptInfo[0],
              receiverAddress: swapInfo.swapELFReceiptInfo[1],
              merklePathBytes: swapInfo.swapELFMerklePathInfo[0].join(','),
              merklePathBool: swapInfo.swapELFMerklePathInfo[1].join(',')
            }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
          >
            <Form.Item
              label="Ethereum Address"
            >
              {swapInfo.ethAddress}
            </Form.Item>

            <Form.Item
              label="Receipt ID"
            >
              <Select
                placeholder="Select a receipt ID"
                allowClear
                style={{ width: 300 }}
                onChange={this.props.onSwapELFReceiptIdChange}
              >
                {/*<Select.Option value={250} key={250}>250 invalid id</Select.Option>*/}
                {swapInfo.receiptIds.map(receiptId => {
                  return <Select.Option value={receiptId.value} key={receiptId.value}>{receiptId.value}</Select.Option>
                })}
              </Select>
            </Form.Item>

            <Form.Item
              label="Swap ID"
              // name="swapId"
              // rules={[{ required: true, message: 'Please input the swap ID!' }]}
            >
              <Input disabled value={swapInfo.swapId}/>
              {/*<Input disabled defaultValue={swapInfo.swapId} value={swapInfo.swapId}/>*/}
            </Form.Item>

            <Form.Item
              label="Origin Amount"
              // name="originAmount"
              // rules={[{ required: true, message: 'Please input the origin amount!' }]}
            >
              <Input disabled value={swapInfo.swapELFReceiptInfo[2]}/>
            </Form.Item>

            <Form.Item
              label="Merkle Path (bytes)"
              // name="merklePathBytes"
              // rules={[{ required: true, message: 'Please input the Merkle Path!' }]}
            >
              <Input disabled value={swapInfo.swapELFMerklePathInfo[0].join(',')}/>
            </Form.Item>

            <Form.Item
              label="Merkle Path (bool)"
              // name="merklePathBool"
              // rules={[{ required: true, message: 'Please input the Merkle Path!' }]}
            >
              <Input disabled value={swapInfo.swapELFMerklePathInfo[1].join(',')}/>
            </Form.Item>

            <Form.Item
              label="Receiver Address"
              // name="receiverAddress"
              // rules={[{ required: true, message: 'Please input the receiver address!' }]}
            >
              <Input disabled value={swapInfo.swapELFReceiptInfo[1]}/>
              {/*<Input />*/}
            </Form.Item>

            <Form.Item
              label="Unique ID"
              // name="uniqueId"
              // rules={[{ required: true, message: 'Please input the unique ID!' }]}
            >
              <Input disabled value={swapInfo.swapELFReceiptInfo[2]}/>
              {/*<Input />*/}
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>

            {swappedLink &&
            <Form.Item
              label="aelf Txn Hash:"
            >
              <a href={swappedLink} target='_blank'>{swappedTxHash}</a>
            </Form.Item>}

          </Form>
        </div>
      </Card>
    );
  }
}
