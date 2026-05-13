const Department = require('../model/departmentModel');

exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    if (!req.user.hospitalId) {
      return res.status(400).json({ message: 'Hospital account not found' });
    }

    const department = new Department({
      name,
      description,
      hospital: req.user.hospitalId
    });

    await department.save();
    res.status(201).json({ message: 'Department added successfully', department });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const query = req.user.hospitalId ? { hospital: req.user.hospitalId } : {};
    const departments = await Department.find(query).sort({ _id: -1 });
    res.status(200).json({ message: 'Departments retrieved successfully', departments });
    } catch (error) {
    console.error('Error retrieving departments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, hospital: req.user.hospitalId },
      { name, description },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOneAndDelete({ _id: id, hospital: req.user.hospitalId });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.softDeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOneAndUpdate(
      { _id: id, hospital: req.user.hospitalId },
      { status: 'inactive' },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department soft deleted successfully', department });
  }
    catch (error) {
    console.error('Error soft deleting department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.restoreDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOneAndUpdate(
      { _id: id, hospital: req.user.hospitalId },
      { status: 'active' },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department restored successfully', department });
  } catch (error) {
    console.error('Error restoring department:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}