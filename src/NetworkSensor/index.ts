import {Component} from 'react';
import {h, on, off, isClient, THoc} from '../util';

export interface INetworkSensorProps {
  children?: (INetworkState) => React.ReactElement<any>;
}

export interface INetworkSensorState {
  online?: boolean;
  since?: Date;
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  type?: string;
}

export class NetworkSensor extends Component<INetworkSensorProps, INetworkSensorState> {
  state: INetworkSensorState;

  get connection () {
    if (typeof navigator !== 'object') {
      return null;
    }

    const nav = navigator as any;

    return nav.connection || nav.mozConnection || nav.webkitConnection;
  }

  constructor (props, context) {
    super(props, context);

    if (isClient) {
      this.state = {
        online: navigator.onLine,
        since: undefined
      };
    } else {
      this.state = {
        online: true,
        since: undefined
      };
    }

    this.state = {
      ...this.state,
      ...this.getConnState()
    };
  }

  componentDidMount() {
    on(window, 'online', this.onOnline);
    on(window, 'offline', this.onOffline);

    const {connection} = this;

    if (connection) {
      on(connection, 'change', this.onNetConnChange);
    }
  }

  componentWillUnmount() {
    off(window, 'online', this.onOnline);
    off(window, 'offline', this.onOffline);

    const {connection} = this;

    if (connection) {
      off(connection, 'change', this.onNetConnChange);
    }
  }

  onOnline = () => {
    this.setState({
      online: true,
      since: new Date()
    });
  };

  onOffline = () => {
    this.setState({
      online: false,
      since: new Date()
    });
  };

  getConnState () {
    const {connection} = this;

    if (!connection) {
      return {};
    }

    const {downlink, downlinkMax, effectiveType, type, rtt} = connection;

    return {
      downlink,
      downlinkMax,
      effectiveType,
      type,
      rtt
    };
  }

  onNetConnChange = () => {
    this.setState(this.getConnState());
  };

  render () {
    return this.props.children(this.state);
  }
}

export const withNetwork: THoc<any, any> = (Comp) =>
  (props) => h(NetworkSensor, null, (net) => h(Comp, {
    ...net,
    ...props
  }));