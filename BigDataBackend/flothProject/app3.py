class Node:
    def __init__(self, node_id, node_type, position, ports, cell_characteristics, size):
        self.node_id = node_id
        self.node_type = node_type
        self.position = position
        self.ports = ports
        self.cell_characteristics = cell_characteristics
        self.size = size

# Create instances of nodes
first_cell = Node(
    node_id="d3f260a9-42ee-4db3-b627-9ebd7ddb318c",
    node_type="First Cell",
    position={"x": 354, "y": 312},
    ports={
        "port1": {"id": "port1", "type": "left", "position": {"x": -6, "y": 41}},
        "port3": {"id": "port3", "type": "top", "position": {"x": 71, "y": -6}},
        "port4": {"id": "port4", "type": "bottom", "position": {"x": 71, "y": 88}},
    },
    cell_characteristics={
        "netVolume": None,
        "pulpArea": None,
        "frothThickness": None,
        "airFlowRate": None,
    },
    size={"width": 0, "height": 82}
)

cleaner = Node(
    node_id="d9585e55-2855-4786-8554-9e8c8eafc442",
    node_type="Cleaner",
    position={"x": 670, "y": 200},
    ports={
        "port1": {"id": "port1", "type": "left", "position": {"x": -6, "y": 41}},
        "port3": {"id": "port3", "type": "top", "position": {"x": 71, "y": -6}},
        "port4": {"id": "port4", "type": "bottom", "position": {"x": 71, "y": 88}},
    },
    cell_characteristics={
        "netVolume": None,
        "pulpArea": None,
        "frothThickness": None,
        "airFlowRate": None,
    },
    size={"width": 0, "height": 82}
)

# Accessing node attributes
print(first_cell.node_id)  # Output: d3f260a9-42ee-4db3-b627-9ebd7ddb318c
