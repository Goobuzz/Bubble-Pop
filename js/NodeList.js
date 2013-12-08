define([], function(){
	"use strict";
	function NodeList(){
		this.first = null;
		this.last = null;
	};
	NodeList.prototype.add = function( node ){
		if( null == this.first ){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			this.last.next = node;
			node.previous = this.last;
			node.next = null;
			this.last = node;
		}
	}
	NodeList.prototype.addSorted = function( node ){
		if( null == this.first ){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			var n = this.last;
			while(n != null){
				if(n.priority <= node.priority){
					break;
				}
				n = n.previous;
			}

			if(n == this.last){
				//console.log("n == this.last");
				this.last.next = node;
				node.previous = this.last;
				node.next = null;
				this.last = node;
			}
			else if(null == n){
				//console.log("null == n");
				node.next = this.first;
				node.previous = null;
				this.first.previous = node;
				this.first = node;
			}
			else{
				//console.log();
				node.next = n.next;
				node.previous = n;
				n.next.previous = node;
				n.next = node;
			}
		}
	}

	NodeList.prototype.addFirst = function( node ){
		if( null == this.first ){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			node.next = this.first;
			this.first.previous = node;
			this.first = node;
		}
	}

	NodeList.prototype.remove = function( node ){
		if( this.first == node ){
			this.first = this.first.next;
		}
		if( this.last == node){
			this.last = this.last.previous;
		}
		if( node.previous != null ){
			node.previous.next = node.next;
		}
		if( node.next != null ){
			node.next.previous = node.previous;
		}
	}

	NodeList.prototype.clear = function(){
		while( null != this.first ){
			var node = this.first;
			this.first = node.next;
			node.previous = null;
			node.next = null;
		}
		this.last = null;
	}
	return NodeList;
});

	//NodeList.prototype.insertSort = function(_func){
		/*if(this.first == this.last){
			return;
		}
		var r = this.first.next;
		//var remains : Node = head.next;
		for( var n = r; n; n = r )
		{
			r = n.next;
			for( var o = n.previous; o; o = o.previous ){
				if( _func( n, o ) >= 0 ){
					// move node to after other
					if( n != o.next ){
						// remove from place
						if ( this.last == n){
							this.last = n.previous;
						}
						n.previous.next = n.next;
						if (null != n.next){
							n.next.previous = n.previous;
						}
						// insert after other
						n.next = o.next;
						n.previous = o;
						n.next.previous = n;
						o.next = n;
					}
					break; // exit the inner for loop
				}
			}
			// the node belongs at the start of the list
			if( null == o ){
				// remove from place
				if ( this.last == n){
					this.last = n.previous;
				}
				n.previous.next = n.next;
				if (n.next){
					n.next.previous = n.previous;
				}
				// insert at head
				n.next = this.first;
				this.first.previous = n;
				n.previous = null;
				this.first = n;
			}
		}*/
	//}

	//NodeList.prototype.mergeSort = function(_func){
		/*if( head == tail )
				{
					return;
				}
				var lists : Vector.<Node> = new Vector.<Node>;
				// disassemble the list
				var start : Node = head;
				var end : Node;
				while( start )
				{
					end = start;
					while( end.next && sortFunction( end, end.next ) <= 0 )
					{
						end = end.next;
					}
					var next : Node = end.next;
					start.previous = end.next = null;
					lists.push( start );
					start = next;
				}
				// reassemble it in order
				while( lists.length > 1 )
				{
					lists.push( merge( lists.shift(), lists.shift(), sortFunction ) );
				}
				// find the tail
				tail = head = lists[0];
				while( tail.next )
				{
					tail = tail.next;	
				}
			}

			private function merge( head1 : Node, head2 : Node, sortFunction : Function ) : Node
			{
				var node : Node;
				var head : Node;
				if( sortFunction( head1, head2 ) <= 0 )
				{
					head = node = head1;
					head1 = head1.next;
				}
				else
				{
					head = node = head2;
					head2 = head2.next;
				}
				while( head1 && head2 )
				{
					if( sortFunction( head1, head2 ) <= 0 )
					{
						node.next = head1;
						head1.previous = node;
						node = head1;
						head1 = head1.next;
					}
					else
					{
						node.next = head2;
						head2.previous = node;
						node = head2;
						head2 = head2.next;
					}
				}
				if( head1 )
				{
					node.next = head1;
					head1.previous = node;
				}
				else
				{
					node.next = head2;
					head2.previous = node;
				}
				return head;
			}
		}*/
	//}