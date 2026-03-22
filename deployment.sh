### Deploy DB Service
kubectl apply -f db/deployment/secret.yaml
kubectl apply -f db/deployment/pvc.yaml
kubectl apply -f db/deployment/deployment.yaml
kubectl apply -f db/deployment/service.yaml
kubectl exec -i deploy/openmotor-db-deployment -- psql -U openmotor_user -d openmotor_db < db/ddl/ddl.sql


### Deploy Backend Service
BACKEND_TAG=$(cat backend/version.txt)
docker build -t openmotor-backend:$BACKEND_TAG backend/
docker tag openmotor-backend:$BACKEND_TAG registry.digitalocean.com/ece1779-team26-cr/openmotor-backend:$BACKEND_TAG
docker push registry.digitalocean.com/ece1779-team26-cr/openmotor-backend:$BACKEND_TAG
kubectl apply -f backend/deployment/secret.yaml
kubectl apply -f backend/deployment/pvc.yaml
kubectl apply -f backend/deployment/deployment.yaml
kubectl apply -f backend/deployment/service.yaml


### Deploy Frontend Service
FRONTEND_TAG=$(cat frontend/version.txt)
docker build --no-cache -t openmotor-frontend:$FRONTEND_TAG frontend/
docker tag openmotor-frontend:$FRONTEND_TAG registry.digitalocean.com/ece1779-team26-cr/openmotor-frontend:$FRONTEND_TAG
docker push registry.digitalocean.com/ece1779-team26-cr/openmotor-frontend:$FRONTEND_TAG
kubectl apply -f frontend/deployment/deployment.yaml
kubectl apply -f frontend/deployment/service.yaml

