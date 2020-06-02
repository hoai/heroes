import React, { Component, Fragment } from 'react';
import { Alert, Button, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Line from '../components/Line';
import Spinner from '../components/Spinner';
import HeroForm from '../components/HeroForm';
import SkillForm from '../components/SkillForm';
import UpdateHeroMutation from '../mutations/UpdateHeroMutation';
import CreateSkillMutation from '../mutations/CreateSkillMutation';

import { QueryRenderer, graphql } from 'react-relay';
import environment from '../Environment';
import Skills from '../components/Skills';

const HeroQuery = graphql`
  query HeroQuery($id: ID!) {
    viewer {
      Hero(id: $id) {
        id
        name
        skills {
          edges {
            node {
              id
              name
              description
              date
            }
          }
        }
        date
      }
    }
  }
`;

class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alert: false,
      spin: false,
      visible: false
    }
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  componentDidMount() {
    if (this.props.location.state) {
      this.setState({ alert: true });
      setTimeout(() => {
        this.setState({ alert: false });
      }, 2000);
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.spin ? <Spinner /> : ''}
        <Drawer
          title="Create a new account"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <SkillForm sendbackData={(name, description, date) => {
            this.setState({ spin: true });
            CreateSkillMutation(this.props.match.params.id, name, description, date)
              .then(() => {
                setTimeout(() => {
                  this.setState({ spin: false, visible: false });
                  window.location.reload();
                }, 1000);
              });
          }} />
        </Drawer>
        <QueryRenderer
          environment={environment}
          query={HeroQuery}
          variables={{
            id: this.props.match.params.id
          }}
          render={({ error, props }) => {
            if (error) {
              return <div>{error.message}</div>;
            } else if (props) {
              let hero = Object.assign({}, props.viewer.Hero);
              return (
                <Fragment>
                  <h1>Hero page</h1>
                  <Line />
                  {this.state.alert ? <Alert style={{ margin: '10px 0' }} message="Data saved successfully" type="success" /> : ''}
                  <HeroForm data={hero} sendbackData={(name, date) => {
                    this.setState({ alert: true });
                    UpdateHeroMutation(this.props.match.params.id, name, date)
                      .then(() => {
                        setTimeout(() => {
                          this.setState({ alert: false });
                        }, 2000);
                      });
                  }} />
                  {hero.skills.edges.length > 0 ? <Skills heroId={this.props.match.params.id} skills={hero.skills} /> : <hr style={{ margin: '20px 0' }} />}
                </Fragment>
              );
            }
            return <div>Ожидание...</div>
          }}
        />
        <Button type="primary" onClick={this.showDrawer}>
          <PlusOutlined /> New skill
        </Button>
      </Fragment>
    );
  }
}

export default Hero;