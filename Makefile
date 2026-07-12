.PHONY: deploy
deploy:
	npm run build
	rsync -avz -e 'ssh -i ~/.ssh/elknir_private_key_openssh' ./build/ elknir@51.158.122.48:~/wakdo-backend.fr/
	ssh -i ~/.ssh/elknir_private_key_openssh elknir@51.158.122.48 "source ~/.nvm/nvm.sh && cd wakdo-backend.fr && npm ci --omit=dev && node ace migration:run --force && pm2 reload wakdo"
