var React = require('react')
    , WunderlistDashboardStore = require('./AdminDashboardStore.js')
    ;

var WunderlistCSVRow = React.createClass({
    render: function() {
        var listNameMap = WunderlistDashboardStore.getListNameMap();
        return (
            <tr>
                <td>{listNameMap[this.props.task.list_id]}</td>
                <td>{this.props.task.title}</td>
                <td>{this.props.created}</td>
                <td>{ this.props.completed}</td>
            </tr>
        )
    }
});

var WunderlistCSVView = React.createClass({
    componentDidMount: function() {
    },
    render: function() {
        var oldRows = WunderlistDashboardStore.getTasksWithTimeFormat();
        var newRows = [];
            for( var i = 0; i<oldRows.length; i++ ) {
                var row = oldRows[i];
                newRows.push( <WunderlistCSVRow task={row.task} key={"csv-"+ row.task.listId +"-row-"+i} created={row.created} completed={row.completed}/> );
            }
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="headerLine">Wunderlist</h1>
                    </div>
                </div>
                <div className="row">
                    <hr/>
                </div>
                <div className="panel panel-default">
                  <div className="panel-heading">Raw Data</div>
                    <table className="table">
                        <thead><tr>
                            <th>{"List"}</th>
                            <th>{"Title"}</th>
                            <th>{"Creation Time"}</th>
                            <th>{"Completion Time"}</th>
                        </tr></thead>
                        <tbody>
                        {newRows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

module.exports = WunderlistCSVView;
