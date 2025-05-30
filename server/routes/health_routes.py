from flask import Blueprint
from controllers.health_controller import HealthController

health_bp = Blueprint('health', __name__)
health_controller = HealthController()

@health_bp.route('/health', methods=['GET'])
def health_check():
    return health_controller.check_health() 