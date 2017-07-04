var FacebookFriends = (function () {
    function FriendsGraph(FB, userId) {
        var app = {
            config: {
                edgeLimit: 100,
                edgeFields: 'likes,comments',
                points: {
                    comment: 10,
                    like: 5,
                    combined: 3
                }
            },

            graph: {},

            buildGraph: function (callback) {
                var that = this;

                this.fetchEdges('/me/posts?fields=' + this.config.edgeFields + '&limit=' + this.config.edgeLimit, function (sortedGraph) {
                    that.fetchEdges('/me/photos?type=uploaded&fields=' + that.config.edgeFields + '&limit=' + that.config.edgeLimit, callback);
                });
            },

            fetchEdges: function (edge, callback) {
                var that = this;

                FB.api(edge, function (response) {
                    that.handleEdgeResponse(response);
                    callback(that.getSortedGraph());
                });
            },

            handleEdgeResponse: function (response) {
                if (typeof response.data !== 'undefined') {
                    var that = this;

                    $.each(response.data, function () {
                        that.filterEdgeItemUserInteractions(this, 'likes');
                        that.filterEdgeItemUserInteractions(this, 'comments');
                    });
                }
            },

            filterEdgeItemUserInteractions: function (item, interaction) {
                if (typeof item[interaction] !== 'undefined') {
                    var that = this;

                    $.each(item[interaction].data, function () {
                        var user = this;
                        var points = that.config.points.like;

                        if (interaction === 'comments') {
                            user = this.from;
                            points = that.config.points.comment;
                        }

                        if (user.id !== userId) {
                            if (typeof that.graph[user.id] === 'undefined') {
                                that.graph[user.id] = {
                                    id: user.id,
                                    points: 0,
                                    name: user.name
                                };
                            }

                            that.graph[user.id].points += points;
                        }
                    });
                }
            },

            getSortedGraph: function () {
                var sortable = [];

                $.each(this.graph, function () {
                    sortable.push(this);
                });

                sortable.sort(function (a, b) {
                    return a.points - b.points;
                });

                return sortable.reverse();
            }
        };

        return {
            build: function (callback) {
                app.buildGraph(callback);
            }
        }
    }

    return FriendsGraph;
})();