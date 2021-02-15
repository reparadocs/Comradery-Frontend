import XInput from '../XInput';
import Callout from '../Callout';
import XTextArea from '../XTextArea';
import XButton from '../XButton';
import Loader from 'react-loader-spinner';
import { Label } from '../Common';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import React, { Component, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Select from 'react-select';
import moment from 'moment';
import ApiClient, { initialPropsHelper } from '../../ApiClient';
import ThreeDots from '../../components/Spinner/ThreeDots.js';
/*
The analytics component for the admin panel.
This is where admins can view analytics for their community.
*/

const timeframe_options = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
];

const analytics_options = [
  { name: 'Users' },
  { name: 'Posts' },
  { name: 'Chat' }
];

const table_timeframe_options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

const dummy_users = [
  {
    name: 'Sharif Shameem',
    comments: 32,
    posts: 4,
    profile_id: 46
  },
  {
    name: 'Alexander Hamilton',
    comments: 21,
    posts: 6,
    profile_id: 45
  },
  {
    name: 'Barack Obama',
    comments: 2,
    posts: 5,
    profile_id: 46
  },
  {
    name: 'Paul Graham',
    comments: 123,
    posts: 12,
    profile_id: 46
  },
  {
    name: 'Donald Trump',
    comments: 4,
    posts: 0,
    profile_id: 46
  },
  {
    name: 'Felix the cat',
    comments: 320,
    posts: 40,
    profile_id: 46
  }
];

function generate_day_labels(num_days = 30) {
  // num_days is the number of days to fetch

  let date_labels = [];
  for (let i = 0; i < num_days; i++) {
    const date = moment()
      .subtract(num_days - i, 'days')
      .format('MMM D');
    date_labels.push(date);
  }
  return date_labels;
}

function generate_week_labels(num_weeks = 3) {
  let date_labels = [];
  for (let i = 0; i < num_weeks; i++) {
    const week_start = moment()
      .subtract(num_weeks - i, 'weeks')
      .format('M/D');
    const week_end = moment()
      .subtract(num_weeks - i, 'weeks')
      .add(6, 'days')
      .format('M/D');

    date_labels.push(`${week_start} - ${week_end}`);
  }
  return date_labels;
}

function generate_month_labels(num_months = 12) {
  let date_labels = [];
  for (let i = 0; i < num_months; i++) {
    date_labels.push(
      moment()
        .subtract(num_months - i, 'months')
        .format('MMM')
    );
  }
  return date_labels;
}

function dummy_chart_data(range = 'days') {
  // generates dummy data for the chart
  let dates;
  if (range === 'days') {
    dates = generate_day_labels(30);
  } else if (range === 'weeks') {
    dates = generate_week_labels(15);
  } else if (range === 'months') {
    dates = generate_month_labels(12);
  }

  let data = [];
  for (let i = 0; i < dates.length; i++) {
    data.push({
      Users: Math.floor(Math.random() * 100 + i * 10),
      date: dates[i]
    });
  }
  return data;
}

const CustomizedAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={16} textAnchor='middle' fill='#666'>
        {payload.value}
      </text>
    </g>
  );
};

const charts = [
  {
    analytics_type: 'Users',
    visualization: 'chart',
    name: 'Active Users',
    description:
      'The number of users who have visited your community at least once a day.',
    color: 'blue',
    range: { value: 'days', label: 'Days' },
    api_slug: 'ACTIVE_USERS'
  },
  {
    analytics_type: 'Users',
    visualization: 'chart',
    name: 'New Users',
    description: 'The number of new users signing up for your community.',
    color: 'purple',
    range: { value: 'days', label: 'Days' },
    api_slug: 'NEW_USERS'
  },
  {
    analytics_type: 'Users',
    visualization: 'table',
    name: 'Most Active Users',
    description: "Your community's power users.",
    range: { value: 'day', label: 'Day' },
    api_slug: 'POWER_USERS'
  },
  {
    analytics_type: 'Posts',
    visualization: 'chart',
    name: 'Post Views',
    description: 'The number of posts that have been viewed.',
    color: 'green',
    range: { value: 'days', label: 'Days' },
    api_slug: 'POST_VIEWS'
  },
  {
    analytics_type: 'Posts',
    visualization: 'chart',
    name: 'Posts Created',
    description: 'The number of posts that have been created.',
    color: 'purple',
    range: { value: 'days', label: 'Days' },
    api_slug: 'POSTS_CREATED'
  },
  {
    analytics_type: 'Posts',
    visualization: 'chart',
    name: 'Comments Created',
    description: 'The number of comments that have been created.',
    color: 'orange',
    range: { value: 'days', label: 'Days' },
    api_slug: 'COMMENTS_CREATED'
  },
  {
    analytics_type: 'Chat',
    visualization: 'chart',
    name: 'Messages Sent',
    description: 'The number of chat messages that have been sent.',
    color: 'blue',
    range: { value: 'days', label: 'Days' },
    api_slug: 'MESSAGES_SENT'
  }
];

class AdminAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeAnalyticsOptions: 'Users',
      charts: charts
    };
    this.onAnalyticsOptionChange = this.onAnalyticsOptionChange.bind(this);
    this.onChartRangeChange = this.onChartRangeChange.bind(this);
  }

  onChartRangeChange(range_option, chart_index) {
    // when the range is changed for a specific chart
    // we must create a clone of the chart dict
    // and update the range field for that chart

    // creating a clone of the charts dict
    let new_charts = JSON.parse(JSON.stringify(this.state.charts));

    // updating the chart
    new_charts[chart_index] = {
      ...new_charts[chart_index],
      range: range_option
    };

    this.setState({ charts: new_charts });
  }

  onAnalyticsOptionChange(e) {
    this.setState({
      activeAnalyticsOptions: e.currentTarget.dataset.analyticsoption
    });
  }

  componentDidMount() {
    // making the api call to populate the chart
    // testing out the api client

    this.state.charts.forEach((chart) => {
      // making an API request for every chart
      ApiClient.post(
        `analytics`,
        { metric: chart.api_slug },
        {
          onError: () => console.log('error fetching chart', chart.api_slug),
          onSuccess: (data) => {
            let load_this = {};
            load_this[chart.api_slug] = data;
            this.setState({ ...load_this });
          }
        }
      );
    });
  }

  render() {
    const Options = analytics_options.map((option, index) => {
      return (
        <div
          onClick={this.onAnalyticsOptionChange}
          key={index}
          data-analyticsoption={option.name}
          style={{
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '29px',
            userSelect: 'none',
            transition: 'all 200ms',
            borderRadius: 4,
            height: '28px',
            color: 'rgba(2, 17, 69, 0.5)',
            paddingRight: '15px',
            paddingLeft: '15px',
            backgroundColor: 'rgba(2, 17, 69, 0.05)',
            marginRight: 8,
            marginBottom: 8,
            cursor: 'pointer',
            alignItems: 'center',
            ...(this.state.activeAnalyticsOptions === option.name
              ? {
                  backgroundColor: 'darkblue',
                  color: 'white',
                  boxShadow: 'none'
                }
              : null)
          }}
        >
          {option.name}
        </div>
      );
    });

    const Charts = this.state.charts.map((chart, index) => {
      if (chart.analytics_type !== this.state.activeAnalyticsOptions) {
        return null;
      }

      switch (chart.visualization) {
        case 'chart':
          // creating the data dict for this chart based on the time range the user has selected
          let data = null;
          if (this.state[chart.api_slug]) {
            if (chart.range.value == 'days') {
              data = this.state[chart.api_slug]['data_30_days'];
            } else if (chart.range.value === 'weeks') {
              data = this.state[chart.api_slug]['data_16_weeks'];
            } else if (chart.range.value === 'months') {
              data = this.state[chart.api_slug]['data_12_months'];
            }
          }

          return (
            <div
              key={index}
              style={{
                width: '100%',
                height: '350px',
                boxShadow: '0 0 8px lightgrey',
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 20px',
                margin: 'auto 12px',
                marginBottom: '30px'
              }}
            >
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 3 }}>
                  <h3>{chart.name}</h3>
                  <p>{chart.description}</p>
                </div>
                <div style={{ flex: 1, marginLeft: '20px', maxWidth: '120px' }}>
                  <Select
                    onChange={(option) =>
                      this.onChartRangeChange(option, index)
                    }
                    value={chart.range}
                    options={timeframe_options}
                  />
                </div>
              </div>

              <div
                style={{ overflow: 'hidden', height: '100%', marginTop: 20 }}
              >
                {chart.data ? (
                  <ThreeDots />
                ) : (
                  <ResponsiveContainer>
                    <AreaChart
                      width={730}
                      height={250}
                      data={data}
                      margin={{ top: 20, right: 35, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`chart-color-${index}`}
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor={chart.color}
                            stopOpacity={0.9}
                          />
                          <stop
                            offset='95%'
                            stopColor={chart.color}
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        interval={1}
                        dataKey='label'
                        tick={<CustomizedAxisTick />}
                      />
                      <YAxis domain={['dataMin', 'dataMax']} />
                      <Tooltip />
                      <Area
                        strokeWidth={1}
                        type='monotone'
                        dataKey='Value'
                        stroke={chart.color}
                        fill={`url(#chart-color-${index}`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          );

        case 'table':
          // creating the array for this table based on the time range the user has selected
          let table_data = null;
          if (this.state[chart.api_slug]) {
            table_data = this.state[chart.api_slug][chart.range.value];
          }

          console.log('table data is ');
          console.log(table_data);
          if (!table_data) {
            return (
              <div
                key={index}
                style={{
                  width: '100%',
                  boxShadow: '0 0 8px lightgrey',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '18px 20px',
                  margin: 'auto 12px',
                  marginBottom: '60px'
                }}
              >
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 3 }}>
                    <h3>{chart.name}</h3>
                    <p>{chart.description}</p>
                  </div>
                  <div
                    style={{ flex: 1, marginLeft: '20px', maxWidth: '120px' }}
                  >
                    <Select
                      onChange={(option) =>
                        this.onChartRangeChange(option, index)
                      }
                      value={chart.range}
                      options={table_timeframe_options}
                    />
                  </div>
                </div>
                <div>
                  <table
                    style={{
                      width: '100%',
                      marginTop: 20
                    }}
                  >
                    <thead
                      style={{
                        borderBottomWidth: 2,
                        borderColor: 'lightgrey'
                      }}
                    >
                      <tr
                        style={{
                          textAlign: 'left',
                          height: 50
                        }}
                      >
                        <th>NAME</th>
                        <th>NUMBER OF POSTS</th>
                        <th>NUMBER OF COMMENTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th colSpan='3'>
                          <ThreeDots />
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          const Rows = table_data.map((user_tuple, index) => {
            let user_id = user_tuple[0];
            let user = user_tuple[1];
            return (
              <tr
                key={index}
                className='admin-analytics-table-row'
                onClick={() => (window.location.href = `/profile/${user_id}`)}
                style={{
                  fontSize: 16,
                  borderBottom: '1px solid lightgrey',
                  height: 50,
                  cursor: 'pointer'
                }}
              >
                <td>{user.name}</td>
                <td>{user.posts}</td>
                <td>{user.comments}</td>
              </tr>
            );
          });
          return (
            <div
              key={index}
              style={{
                width: '100%',
                boxShadow: '0 0 8px lightgrey',
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 20px',
                margin: 'auto 12px',
                marginBottom: '60px'
              }}
            >
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 3 }}>
                  <h3>{chart.name}</h3>
                  <p>{chart.description}</p>
                </div>
                <div style={{ flex: 1, marginLeft: '20px', maxWidth: '120px' }}>
                  <Select
                    onChange={(option) =>
                      this.onChartRangeChange(option, index)
                    }
                    value={chart.range}
                    options={table_timeframe_options}
                  />
                </div>
              </div>

              <div>
                <table
                  style={{
                    width: '100%',
                    marginTop: 20
                  }}
                >
                  <thead
                    style={{
                      borderBottomWidth: 2,
                      borderColor: 'lightgrey'
                    }}
                  >
                    <tr
                      style={{
                        textAlign: 'left',
                        height: 50
                      }}
                    >
                      <th>NAME</th>
                      <th>NUMBER OF POSTS</th>
                      <th>NUMBER OF COMMENTS</th>
                    </tr>
                  </thead>
                  <tbody>{Rows}</tbody>
                </table>
              </div>
            </div>
          );
        default:
          return null;
      }
    });

    return (
      <div className='admin-inner col'>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            borderBottom: '1px solid lightgrey',
            marginTop: '40px',
            marginBottom: '20px'
          }}
        >
          <h1 style={{ marginRight: 20, fontWeight: 600 }}>
            Select an analytics category
          </h1>
          {Options}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%'
          }}
        >
          {Charts}
        </div>
      </div>
    );
  }
}

export default AdminAnalytics;
