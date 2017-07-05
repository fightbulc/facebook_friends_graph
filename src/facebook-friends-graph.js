var FacebookFriends = (function () {
    function FriendsGraph(FB, userId, customOptions) {
        var defaultOptions = {
            picture: {
                width: 50,
                height: 50
            }
        };

        var app = {
            config: {
                edgeLimit: 100,
                edgeFields: 'likes,comments',
                points: {
                    comment: 10,
                    like: 5,
                    combined: 3
                },
                options: $.extend(defaultOptions, customOptions)
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
                                    name: user.name,
                                    url_picture: that.buildUserUrlPicture(user.id)
                                };
                            }

                            that.graph[user.id].points += points;
                        }
                    });
                }
            },

            buildUserUrlPicture: function (userId) {
                return 'https://graph.facebook.com/' + userId + '/picture?width=' + this.config.options.picture.width + '&height=' + this.config.options.picture.height;
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